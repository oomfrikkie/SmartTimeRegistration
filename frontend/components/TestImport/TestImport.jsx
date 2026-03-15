import { useState } from "react";

export default function TestImport() {

  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [response, setResponse] = useState(null);

  const importCalendar = async () => {
    const res = await fetch("http://localhost:3000/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        icsUrl: link,
        start_date: startDate,
        end_date: endDate,
        account_id: 1
      }),
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Test Calendar Import</h2>

      <input
        type="text"
        placeholder="ICS Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={{ width: "400px", marginBottom: "10px" }}
      />

      <br />

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <br />

      <button onClick={importCalendar}>Import Calendar</button>

      <pre>
        {response && JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}