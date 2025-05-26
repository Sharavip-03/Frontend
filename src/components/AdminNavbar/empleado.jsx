import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaBone, FaPaw, FaShoppingCart, FaFileInvoice, FaSignOutAlt, FaChevronDown, FaBars } from "react-icons/fa";
import "./admin.css";
import logo from "../../assets/images/logo.png";

const SidebarItem = ({ icon, text, subItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item" onClick={() => setIsOpen(!isOpen)}>
        {icon}
        <span>{text}</span>
        <FaChevronDown className={`arrow-icon ${isOpen ? "open" : ""}`} />
      </div>
      {isOpen && subItems && (
        <div className="sidebar-submenu">
          {subItems.map((sub, index) => (
            <Link key={index} to={sub.path} className="sidebar-subitem">
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuEmp = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
    {isMobile && (
      <>
        <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FaBars />
        </button>
        {isMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)} />}
      </>
    )}

    <div className={`sidebar ${isMobile && isMenuOpen ? "open" : ""}`}>
        {!isMobile && (
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>
        )}

        <nav className="sidebar-menu">
          <SidebarItem 
            icon={<FaBone />} 
            text="Productos" 
            subItems={[
              { name: "Inventario", path: "/empleado/inventario" }, // Cambiado a /empleado/inventario
              { name: "Categorías", path: "/empleado/categoria" },
              { name: "Marca", path: "/empleado/marcas" }
            ]} 
          />
          <SidebarItem 
            icon={<FaPaw />} 
            text="Animales" 
            subItems={[
              { name: "Animales", path: "/empleado/animales" }
            ]} 
          />
          <SidebarItem 
            icon={<FaShoppingCart />} 
            text="Ventas" 
            subItems={[
              { name: "Descuentos", path: "/empleado/descuentos" },
            ]} 
          />
          <SidebarItem 
            icon={<FaFileInvoice />} 
            text="Reportes" 
            subItems={[
              { name: "Ver reportes", path: "/empleado/dashboard" }
            ]} 
          />
        </nav>

        <div className="sidebar-exit" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("id");
          localStorage.removeItem("isLogged");
          navigate("/");
        }}>
          <FaSignOutAlt /> Cerrar sesión
        </div>
      </div>
    </>
  );
};

export default MenuEmp;
