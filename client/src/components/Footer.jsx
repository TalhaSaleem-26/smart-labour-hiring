import "react";

export default function Footer() {
  return (
    <footer style={s.foot}>
      <p style={s.text}>
        © {new Date().getFullYear()} <strong style={{ color:"#a78bfa" }}>SmartLabour</strong> — All rights reserved.
      </p>
      <p style={s.sub}>Built with ❤️ at SZABIST University</p>
    </footer>
  );
}

const s = {
  foot: { borderTop:"1px solid rgba(255,255,255,0.06)", padding:"16px 24px", background:"#0d0d1f", textAlign:"center" },
  text: { fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 },
  sub:  { fontSize:11, color:"rgba(255,255,255,0.2)", margin:"4px 0 0" },
};