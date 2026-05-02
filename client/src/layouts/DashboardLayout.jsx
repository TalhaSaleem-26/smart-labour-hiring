/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#080813", fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── Mobile Overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.6)",
            zIndex:99,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        position:"fixed", top:0, left:0, height:"100vh", zIndex:100,
        transform: isMobile
          ? sidebarOpen ? "translateX(0)" : "translateX(-100%)"
          : "translateX(0)",
        transition:"transform 0.3s ease",
        width: isMobile ? 240 : collapsed ? 72 : 240,
      }}>
        <Sidebar
          collapsed={isMobile ? false : collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* ── Right Content ── */}
      <div style={{
        flex:1,
        marginLeft: isMobile ? 0 : collapsed ? 72 : 240,
        transition:"margin-left 0.3s ease",
        display:"flex", flexDirection:"column", minHeight:"100vh",
        width: isMobile ? "100%" : "auto",
      }}>
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />

        <main style={{ flex:1, padding:"clamp(12px,3vw,24px)", boxSizing:"border-box" }}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}