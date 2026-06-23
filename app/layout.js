export const metadata = {
  title: 'Censorship Watch — Live (OONI)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>{`
          :root{
            --bg:#0f1724; --card:#0b1220; --muted:#9aa6b2; --accent:#06b6d4;
            --good:#10b981; --warn:#f59e0b; --bad:#ef4444; color-scheme: dark;
          }
          body{font-family:Inter,ui-sans-serif,system-ui,-apple-system; margin:0; background:linear-gradient(180deg,#071024 0%, #071622 100%); color:#e6eef6;}
          header{padding:20px 24px; display:flex; align-items:center; gap:16px; border-bottom:1px solid rgba(255,255,255,.03)}
          h1{margin:0;font-size:20px}
          .sub{color:var(--muted); font-size:13px}
          .wrap{display:flex; gap:18px; padding:18px; align-items:flex-start}
          .col{background:var(--card); border-radius:12px; padding:14px; box-shadow:0 6px 18px rgba(2,6,23,.6); flex:1; min-width:300px}
          #left{flex:0.9}
          #right{flex:0.6; max-width:520px}
          .country{display:flex; justify-content:space-between; padding:10px; border-radius:8px; cursor:pointer; margin-bottom:8px; align-items:center;}
          .country:hover{background:linear-gradient(90deg, rgba(255,255,255,.01), rgba(255,255,255,.02))}
          .badge{padding:6px 8px; border-radius:999px; font-weight:600; font-size:12px}
          .small{font-size:12px;color:var(--muted)}
          table{width:100%; border-collapse:collapse; margin-top:10px}
          th,td{padding:8px 6px; text-align:left; font-size:13px; border-bottom:1px dashed rgba(255,255,255,.03)}
          .tag{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;margin-right:6px;background:rgba(255,255,255,.02)}
          .domain{font-weight:600}
          .spinner{height:16px;width:16px;border:2px solid rgba(255,255,255,.06);border-top-color:var(--accent); border-radius:50%; animation:spin 1s linear infinite; display:inline-block}
          @keyframes spin{to{transform:rotate(360deg)}}
          .controls{display:flex;gap:8px;align-items:center;margin-bottom:10px}
          input[type=search]{background:transparent;border:1px solid rgba(255,255,255,.04);padding:8px;border-radius:8px;color:inherit;min-width:220px}
          footer{padding:12px 24px;color:var(--muted); font-size:13px; border-top:1px solid rgba(255,255,255,.02)}
          .pill{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.02); font-size:13px}
          .methods{display:flex;flex-wrap:wrap;gap:6px}
          .muted{color:var(--muted)}
          @media (max-width:900px){.wrap{flex-direction:column}.col{width:100%}}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
