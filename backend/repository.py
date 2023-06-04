from flask import json
from rdflib import Graph
import requests
import urllib

from backend.util import import_data, convert_sparql_json_result

BAD_REQUEST = 400


class RDFRepository:
    def __init__(self, *, name):
        self.name = name

    def run_query(self, *, query: str):
        pass


class LocalRepository(RDFRepository):
    def __init__(self, *, name, graph: Graph):
        super().__init__(name=name)
        self.graph = graph

    def run_query(self, *, query: str):
        try:
            result = self.graph.query(query)

            if result.type == 'SELECT':
                header = [str(column) for column in result.vars]
                data = [[str(value) for value in row] for row in result]
            elif result.type == 'BOOL':
                header = ['boolean']
                data = [[bool(result)]]
            else:
                header = ['Subject', 'Predicate', 'Object']
                data = [[str(value) for value in row] for row in result]

            return {'header': header, 'data': data}

        except Exception as e:
            return {'header': [['ERROR']], 'data': str(e)}


class RemoteRepository(RDFRepository):
    def __init__(self, *, name, endpoint):
        super().__init__(name=name)
        self.endpoint = endpoint

    def run_query(self, *, query: str):
        response = requests.get(
            f'{self.endpoint}?query={urllib.parse.quote(query, safe="")}',
            headers={'Accept': 'application/sparql-results+json'})
        result = response.json()
        # results = response.text.replace('\r', '')
        # header = []
        # data = []
        #
        # if response.status_code == BAD_REQUEST:
        #     header = ['ERROR']
        #     data = [[results]]
        #
        # elif is_json(results):  # For ASK queries
        #     obj = json.loads(results)
        #     if 'boolean' in obj:
        #         header = ['boolean']
        #         data = [[str(obj['boolean']).lower()]]
        #
        # elif is_ntriples_format(results):  # For CONSTRUCT queries
        #     header = ['Subject', 'Predicate', 'Object']
        #     data = parse_ntriples_graph(results)
        #
        # else:  # For SELECT queries
        #     header = results.split('\n')[0].split(',')
        #     data = parse_csv_text(results)

        return convert_sparql_json_result(result)


if __name__ == '__main__':
    graph = import_data(
        data_url='https://www.dbis.informatik.uni-goettingen.de/Mondial'
                 '/Mondial-RDF/mondial.n3',
        schema_url='https://www.dbis.informatik.uni-goettingen.de/Mondial'
                   '/Mondial-RDF/mondial-meta.n3 '
    )
    repo = LocalRepository(name="mondial", graph=graph)

    qry = '''
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
    
    SELECT ?inflation ?unemployment
    WHERE {
      ?c rdf:type :Country ;
        :name "India" ;
        :inflation ?inflation ;
        :unemployment ?unemployment .
    }
    '''
    print(repo.run_query(query=qry))
