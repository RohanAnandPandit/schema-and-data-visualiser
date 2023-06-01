import re
import shlex
from typing import Dict
import requests
import urllib

from .util import remove_comments, is_url, separator_split

QUERY_PATH = 'backend/queries'


class QueryAnalyser:
    def __init__(self, *, query: str, api: str, repository: str):
        self.query = remove_comments(query)
        self.api = api
        self.repository = repository
        self.prefixes = self.get_prefixes()
        # Dictionary of all triples in where clause
        self.triples = {}
        # Mapping from a key to the class variable it is a key of
        self.key_of_var = {}
        # Mapping from a data variable to its class variable
        self.data_prop_of_var = {}
        # Variables in the select clause
        self.select_variables = self.get_select_variables()
        # Type of data variable
        self.data_var_type = {}
        # Class of variable if it is an object
        self.var_class = {}
        # All functional properties used in query
        self.func_props = set()
        # All inverse functional properties used in query
        self.key_func_props = set()
        self.scan_conditions()
        # Different type categories for the variables
        self.var_categories = self.get_variable_categories()

    def get_prefixes(self):
        prefixes = {}
        prefix_pattern = re.compile(
            r'prefix\s+(?P<name>[^\s\n]+)\s+<(?P<uri>[^\s\n]+)>\s*\n',
            re.IGNORECASE | re.MULTILINE | re.DOTALL)
        for name, uri in prefix_pattern.findall(self.query):
            prefixes[name] = uri

        return prefixes

    def scan_conditions(self):
        conditions = get_where_clause(self.query)

        statement_pattern = re.compile(
            r'^(\n*|;) *(?P<subject>\?\w+) +(?P<properties>[^.]+)\s*\.\s*$',
            re.IGNORECASE | re.MULTILINE | re.DOTALL)

        statements = statement_pattern.finditer(conditions)

        for match in statements:
            subject = match.group('subject')
            properties = match.group('properties')

            if subject not in self.triples:
                self.triples[subject] = {}

            pairs = [shlex.split(s.strip()) for s in
                     separator_split(properties)]

            for [prop, obj] in pairs:
                if prop in ['rdf:type', 'rdfs:type',
                            'a'] and is_sparql_variable(subject):
                    self.var_class[subject] = obj
                    continue

                prop_uri = get_full_uri(uri=prop, prefixes=self.prefixes)

                self.add_triple(subject, prop_uri, obj)

                if not prop_uri or not is_sparql_variable(obj):
                    continue

                prop_types = list(map(remove_prefix,
                                      self.get_types(uri=prop_uri)))

                if 'DatatypeProperty' in prop_types:
                    self.data_var_type[obj] = self.get_prop_range(
                        prop_uri=prop_uri)
                    self.data_prop_of_var[obj] = subject

                if 'FunctionalProperty' in prop_types:
                    self.func_props.add(prop_uri)

                if 'InverseFunctionalProperty' in prop_types:
                    self.key_of_var[obj] = subject
                    self.key_func_props.add(prop_uri)

    def add_triple(self, sub: str, predicate: str, obj: str):
        if sub not in self.triples:
            self.triples[sub] = {}
        if predicate not in self.triples[sub]:
            self.triples[sub][predicate] = set()

        self.triples[sub][predicate].add(obj)

    def get_prop_range(self, *, prop_uri: str):
        metadata = get_metadata(uri=prop_uri, api=self.api,
                                repository=self.repository)

        return metadata['range']

    def get_types(self, *, uri: str):
        with open(f'{QUERY_PATH}/get_type.sparql', 'r') as query:
            encoded = urllib.parse.quote(query.read().format(uri=uri), safe="")
            response = requests.get(
                f'{self.api}/repositories/{self.repository}'
                f'?query={encoded}')

        return response.text.replace('\r', '').splitlines()[1:]

    def get_select_variables(self):
        """
        List of variables used in the SELECT statement of the query
        :param query:
        :return:
        """
        select_pattern = re.compile(
            r'select +(distinct +)?(?P<variables>.+)\n*(from|where)',
            re.MULTILINE | re.IGNORECASE | re.DOTALL)

        select_statement = select_pattern.search(self.query)

        if not select_statement:
            return []

        line = select_statement.group('variables')
        names = [token for token in shlex.split(line) if token.startswith('?')]

        return names

    def is_data_property(self, *, prop_uri: str):
        types = self.get_types(uri=prop_uri)
        return 'DatatypeProperty' in list(map(remove_prefix, types))

    def get_variable_categories(self) -> Dict:
        """
        Returns the variables of different categories
        :param repository:
        :param api:
        :param var_prop:
        :param var_class:
        :param variables:
        :param var_type:
        :return:
        """
        var_categories = {
            'key': [],
            'scalar': [],
            'temporal': [],
            'geographical': [],
            'lexical': [],
            'date': [],
            'object': [],
            'numeric': []
        }
        for var in self.select_variables:
            var_name = variable_name(var)
            if var in self.var_class:
                var_categories['object'].append(var_name)
                continue

            if var in self.key_of_var:
                var_categories['key'].append(var_name)

            if var in self.data_var_type:
                type_name = remove_prefix(self.data_var_type[var])

                for catg in type_category(type_uri=type_name):
                    var_categories[catg].append(var_name)

        var_categories['scalar'] = var_categories['temporal'] + \
                                   var_categories['numeric']

        return var_categories

    def class_vars_used(self):
        class_vars = set()

        for var in self.select_variables:
            class_vars.add(self.data_prop_of_var[var])

        return len(class_vars)

    def connected_by_props(self, var_a: str, var_b: str,
                           func_props=False, key_func_props=False) -> bool:
        stack = [var_a]
        while stack:
            curr = stack.pop()

            if curr == var_b:
                return True
            if curr not in self.triples:
                continue

            for prop in self.triples[curr]:
                if func_props and prop not in self.func_props:
                    continue

                if key_func_props and prop not in self.key_func_props:
                    continue

                obj_list = self.triples[curr][prop]
                for obj in obj_list:
                    if is_sparql_variable(obj):
                        stack.append(obj)

        return False

    def class_with_data_properties(self):
        if self.class_vars_used() != 1:
            return False
        for var in self.select_variables:
            if var not in self.data_var_type:
                return False

        return True

    def two_classes_linked_by_func_prop(self) -> Dict:
        if self.class_vars_used() != 2:
            return False

        if len(self.key_of_var) < 2:
            return False

        key_vars = [var for var in self.select_variables if
                    var in self.key_of_var]

        for i in range(len(key_vars) - 1):
            class_var_a = self.key_of_var[key_vars[i + 1]]
            class_var_b = self.key_of_var[key_vars[i]]

            if not self.connected_by_props(class_var_a, class_var_b,
                                           func_props=True):
                return False

        return True

    def two_classes_linked_by_key_func_prop(self) -> Dict:
        if self.class_vars_used() != 2:
            return False

        key_vars = [var for var in self.select_variables if
                    var in self.key_of_var]

        if len(key_vars) != 2:
            return False

        for i in range(len(key_vars) - 1):
            class_var_a = self.key_of_var[key_vars[i]]
            class_var_b = self.key_of_var[key_vars[i + 1]]

            if not self.connected_by_props(class_var_a, class_var_b,
                                           key_func_props=True):
                return False

        return True

    def three_classes_linked_by_func_props(self):
        if self.class_vars_used() != 3:
            return False

        key_vars = [var for var in self.select_variables if
                    var in self.key_of_var]

        if len(key_vars) != 2:
            return False

        TBK = key_vars[0]
        TCK = key_vars[1]
        TA1 = self.select_variables[2]
        CA = self.data_prop_of_var[TA1]
        CB = self.data_prop_of_var[TBK]
        CC = self.data_prop_of_var[TCK]

        if self.connected_by_props(CA, CB) and self.connected_by_props(CA, CC):
            return True

        return False


def is_sparql_variable(s: str):
    return s.startswith('?')


def variable_name(var: str):
    return var.replace('?', '')


def remove_prefix(uri: str, prefix=None) -> str:
    """
    Remove the prefix of a URI
    :param uri:
    :param prefix:
    :return:
    """
    if not uri:
        return ''
    if prefix:
        return uri.replace(prefix, '')

    return uri.split('/')[-1].split('#')[-1]


def get_full_uri(*, uri: str, prefixes) -> str | None:
    """
    Substitute the prefix back to get the original URI
    :param uri:
    :param prefixes:
    :return:
    """
    for prefix in prefixes:
        if is_url(uri):
            return uri
        uri = uri.replace(prefix, prefixes[prefix])

    if not is_url(uri):
        return None

    return uri


def get_metadata(*, uri: str, api: str, repository: str):
    """
    Returns metadata of a property
    :param uri:
    :param api:
    :param repository:
    :return:
    """
    with open(f'{QUERY_PATH}/meta_information.sparql', 'r') as query:
        encoded_query = urllib.parse.quote(
            query.read().format(uri=uri), safe="")
        response = requests.get(
            f'{api}/repositories/{repository}'
            f'?query={encoded_query}')

    info = response.text.replace('\r', '')

    fields = info.split('\n')[0].split(',')
    values = info.split('\n')[1].split(',')

    return dict(zip(fields, values))


def type_category(*, type_uri) -> [str]:
    """
    Returns the category of the range of a property
    :param type_uri:
    :return:
    """

    categories_types = {
        'numeric': {'int', 'integer', 'decimal', 'negativeInteger',
                    'nonNegativeInteger'},
        'temporal': {'gDay', 'gYear', 'time', 'gMonth', 'gMonthDay',
                     'gYearMonth'},
        'date': {'date'  'dateTime'},
        'lexical': {'string'},
        'geographical': {}
    }

    type_name = remove_prefix(type_uri)
    categories = []
    for ctg in categories_types:
        if type_name in categories_types[ctg]:
            categories.append(ctg)

    return categories if categories else ['object']


def get_where_clause(query: str):
    pattern = re.compile(r'\s*where\s*\{\s*(?P<conditions>.*)\s*\}\s*',
                         re.IGNORECASE | re.MULTILINE | re.DOTALL)
    return max(pattern.findall(query), key=len)


def query_analysis(query: str, api: str, repository):
    query = remove_comments(query)
    analyser = QueryAnalyser(query=query, api=api, repository=repository)
    pattern = None
    visualisations = []
    if analyser.class_with_data_properties():
        pattern = 'Class with data properties'
        visualisations = ['Calendar', 'Scatter', 'Bubble', 'Bar',
                          'Choropleth Map', 'Word Cloud']
    elif analyser.two_classes_linked_by_func_prop():
        pattern = 'Two classes linked by a functional property'
        visualisations = ['Tree Map', 'Hierarchy Tree', 'Circle Packing',
                          'Sunburst']
    elif analyser.two_classes_linked_by_key_func_prop():
        pattern = 'Two classes linked by a key functional property'
        visualisations = ['Line', 'Spider', 'Stacked Bar', 'Grouped Bar']
    elif analyser.three_classes_linked_by_func_props():
        pattern = 'Three classes linked by a functional property'
        visualisations = ['Sankey', 'Network', 'Chord Diagram', 'Heat Map']

    result = {'pattern': pattern, 'variables': analyser.var_categories,
              'visualisations': visualisations}

    return result


if __name__ == '__main__':
    example_query = '''
PREFIX rdfs: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
SELECT ?inflation ?unemployment
WHERE {
  ?c rdf:type :Country ;
    :inflation ?inflation ;
    :unemployment ?unemployment .
}
    '''
