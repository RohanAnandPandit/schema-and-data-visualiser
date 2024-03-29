import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Menu, Tooltip } from "antd";
import { useStore } from "../../stores/store";
import { TbSpade } from "react-icons/tb";

const Navbar = () => {
  const rootStore = useStore();
  const authStore = rootStore.authStore;

  const items: any = [
    {
      key: "logo",
      icon: <TbSpade size={20} />,
      label: <Tooltip title="SPARQL Analyser & Data Explorer">SPADE</Tooltip>,
      children: [],
    },
    {
      key: "User",
      icon: <UserOutlined />,
      label: authStore.username,
      children: [
        {
          key: "Log out",
          label: "Log out",
          onClick: () => authStore.logout(),
        },
      ],
    },
    {
      key: "Home",
      label: <Link to="/">Home</Link>,
    },
    {
      key: "Contact",
      label: <Link to="/contact">Contact</Link>,
    },
  ];
  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={["Home"]}
      items={items}
    />
  );
};

export default Navbar;
