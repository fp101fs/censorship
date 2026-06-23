'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [state, setState] = useState({ measurements: [], byCountry: {}, methods: {} });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [spotCountry, setSpotCountry] = useState('—');
  const [spotCount, setSpotCount] = useState(0);
  const [spotDetails, setSpotDetails] = useState(
    '<div class="small muted">Click a country on the left to see top blocked domains and methods.</div>'
  );
  const [lastUpdated, setLastUpdated] = useState('—');

  const API_ROOT = 'https://api.ooni.io/api/v1/measurements';
  const limit = 200;

  const extractDomain = (input) => {
    try {
      if (!input) return '';
      const u = String(input).trim();
      if (u.startsWith('http')) {
        const hostname = new URL(u).hostname;
        return hostname.replace(/^www\./, '');
      }
      return u.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
    } catch {
      return input;
    }
  };

  const escapeHtml = (s) =>
    String(s || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));

  const severityColor = (count) => {
    if (count > 80) return 'linear-gradient(90deg,#ef4444,#ffb4b4)';
    if (count > 25) return 'linear-gradient(90deg,#f59e0b,#ffdca3)';
    if (count > 4) return 'linear-gradient(90deg,#10b981,#bff3dc)';
    return 'rgba(255,255,255,.03)';
  };

  const severityLabel = (count) => {
    if (count > 80) return 'High';
    if (count > 25) return 'Med';
    if (count > 4) return 'Low';
    return 'Tiny';
  };

  const estimateMethod = (examples, domain) => {
    const counts = {};
    for (const ex of examples) {
      if (ex.domain === domain) {
        counts[ex.test] = (counts[ex.test] || 0) + 1;
      }
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return 'method: unknown';
    const top = entries[0][0];
    const map = {
      web_connectivity: 'HTTP/S block / censorship (includes blockpages, TLS interference)',
      tcp_connect: 'IP-level blocking / TCP reset',
      dns_consistency: 'DNS tampering / spoofing',
      http_requests_interference: 'HTTP interference',
      ndt: 'speed test (not censorship)',
      tls_handshake: 'TLS blocking or MITM',
    };
    return map[top] || top;
  };

  const fetchData = async () => {
    setLoading(true);
    setSpotCountry('—');
    setSpotCount(0);
    setSpotDetails(
      '<div class="small muted">Click a country on the left to see top blocked domains and methods.</div>'
    );

    try {
      const url = `${API_ROOT}?confirmed=true&limit=${limit}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('API error: ' + r.status);
      const data = await r.json();
      const results = data.results || data || [];

      const byCountry = {};
      const methods = {};
      for (const m of results) {
        const cc = (m.probe_cc || 'ZZ').toUpperCase();
        if (!byCountry[cc])
          byCountry[cc] = { count: 0, domains: {}, tests: {}, examples: [] };
        byCountry[cc].count++;
        const input =
          (m.input ||
            (m.test_keys && (m.test_keys.request_url || m.test_keys.input)) ||
            '') + '';
        const domain =
          extractDomain(input) ||
          input ||
          (m.test_keys && m.test_keys.hostname) ||
          '(unknown)';
        byCountry[cc].domains[domain] = (byCountry[cc].domains[domain] || 0) + 1;
        const test = m.test_name || 'unknown';
        byCountry[cc].tests[test] = (byCountry[cc].tests[test] || 0) + 1;
        byCountry[cc].examples.push({
          time: m.measurement_start_time || m.report_id || '',
          domain,
          test,
        });
        methods[test] = (methods[test] || 0) + 1;
      }

      setState({ measurements: results, byCountry, methods });
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setLastUpdated('error');
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (cc) => {
    const info = state.byCountry[cc];
    if (!info) return;
    setSpotCountry(cc);
    setSpotCount(info.count);

    const domainRows = Object.entries(info.domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40);
    const testRows = Object.entries(info.tests).sort((a, b) => b[1] - a[1]);

    let html = `<div style="margin-bottom:8px"><strong>Top domains</strong></div>`;
    html +=
      '<div style="display:flex;flex-direction:column;gap:6px">';
    for (const [d, c] of domainRows) {
      html += `<div style="display:flex;justify-content:space-between;align-items:center"><div><span class="domain">${escapeHtml(d)}</span><div class="small muted" style="margin-top:4px">seen ${c} time(s)</div></div><div class="small muted">${estimateMethod(info.examples, d)}</div></div>`;
    }
    html += '</div>';
    html += `<hr style="border:none;border-top:1px dashed rgba(255,255,255,.03);margin:10px 0">`;
    html += `<div><strong>Observed test types / methods</strong></div>`;
    html += '<div style="margin-top:8px">';
    for (const [t, c] of testRows) {
      html += `<div style="display:flex;justify-content:space-between"><div class="tag">${escapeHtml(t)}</div><div class="small muted">${c}</div></div>`;
    }
    html += '</div>';
    html += `<hr style="border:none;border-top:1px dashed rgba(255,255,255,.02);margin:10px 0">`;
    html += `<div><strong>Example measurements</strong></div>`;
    html += '<div style="margin-top:8px">';
    for (const ex of info.examples.slice(0, 8)) {
      html += `<div class="small muted" style="margin-bottom:6px">${new Date(ex.time || Date.now()).toLocaleString()} · <span class="domain">${escapeHtml(ex.domain)}</span> · <span class="tag">${escapeHtml(ex.test)}</span></div>`;
    }
    html += '</div>';
    setSpotDetails(html);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const countryRows = Object.entries(state.byCountry)
    .sort((a, b) => b[1].count - a[1].count)
    .filter((row) => {
      if (!query) return true;
      const q = query.toLowerCase();
      const cc = row[0].toLowerCase();
      const top = row[1].domains ? Object.keys(row[1].domains)[0]?.toLowerCase() || '' : '';
      return cc.includes(q) || top.includes(q) || row[1].count.toString().includes(q);
    });

  const recentRows = state.measurements.slice(0, 60);
  const methodEntries = Object.entries(state.methods)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return (
      <>
        <header>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1>Global Censorship Watch (live)</h1>
            <div className="sub">
              Data source: OONI — open, volunteer measurements (live via api.ooni.io)
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="small muted">last updated: {lastUpdated}</div>
            <div
              className="pill"
              onClick={fetchData}
              style={{ cursor: 'pointer' }}
            >
              Refresh
            </div>
          </div>
        </header>

        <div className="wrap">
          <div id="left" className="col">
            <div className="controls">
              <input
                type="search"
                placeholder="Filter country code, domain or test (e.g. 'IR', 'wikipedia')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                  <div className="spinner"></div>
                  <span className="small muted">loading live OONI data...</span>
                </div>
              )}
            </div>

            <div id="countryList" style={{ marginTop: '6px' }}>
              {countryRows.map(([cc, info]) => {
                const topDomain =
                  Object.entries(info.domains).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                return (
                  <div
                    key={cc}
                    className="country"
                    onClick={() => selectCountry(cc)}
                  >
                    <div>
                      <div style={{ fontWeight: '700' }}>{cc}</div>
                      <div className="small muted">{topDomain}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="small muted">{info.count}</div>
                      <div
                        className="badge"
                        style={{
                          background: severityColor(info.count),
                          color: '#001825',
                        }}
                      >
                        {severityLabel(info.count)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '12px' }}>
              <div className="small muted">Recent raw measurements (preview)</div>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Country</th>
                    <th>Domain / Input</th>
                    <th>Test</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((m, i) => {
                    const time = new Date(
                      m.measurement_start_time || m.report_id || Date.now()
                    ).toLocaleString();
                    const cc = (m.probe_cc || 'ZZ').toUpperCase();
                    const input =
                      (m.input ||
                        (m.test_keys && (m.test_keys.request_url || m.test_keys.input)) ||
                        '') + '';
                    const domain = extractDomain(input) || input || '(unknown)';
                    const test = m.test_name || 'unknown';
                    return (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>{time}</td>
                        <td>{cc}</td>
                        <td className="domain">{escapeHtml(domain)}</td>
                        <td>
                          <span className="tag">{escapeHtml(test)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div id="right" className="col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div className="small muted">Country spotlight</div>
                <div id="spotCountry" style={{ fontSize: '18px', fontWeight: '700' }}>
                  {spotCountry}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="small muted">Measurements shown</div>
                <div id="spotCount" style={{ fontWeight: '700' }}>
                  {spotCount}
                </div>
              </div>
            </div>

            <div
              id="spotDetails"
              style={{ minHeight: '120px' }}
              dangerouslySetInnerHTML={{ __html: spotDetails }}
            />

            <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,.03)', margin: '14px 0' }} />

            <div>
              <div className="small muted">Top observed methods (by measurement count)</div>
              <div id="methodList" style={{ marginTop: '8px' }} className="methods">
                {methodEntries.map(([test, c]) => (
                  <div key={test} className="tag">
                    {test} — {c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div className="small muted">Notes</div>
              <div className="muted small" style={{ marginTop: '6px' }}>
                • Data is powered by OONI's measurements API (open, volunteer-run probes).
                Confirmed measurements generally indicate a block or visible anomaly.
                <br />• "Test names" such as <code>web_connectivity</code>, <code>tcp_connect</code>,
                <code>dns_consistency</code> indicate the experiment run and help infer blocking method
                (IP block, DPI, DNS interference, etc.).
              </div>
            </div>
          </div>
        </div>

        <footer>
          Live API: <a href="https://api.ooni.io" style={{ color: 'var(--accent)' }}>api.ooni.io</a> · Data
          license: open. Built with Next.js.
        </footer>
      </>
    );
}
