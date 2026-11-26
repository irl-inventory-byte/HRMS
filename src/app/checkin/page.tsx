export default function CheckInPage() {
  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 20px" }}>
      <h1>Walk-in Check-In</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 20 }}>
        Please fill this out and a member of our team will call you shortly.
      </p>
      <div className="card">
        <form action={async (formData) => {
          "use server";
          const { selfCheckIn } = await import("./actions");
          await selfCheckIn(formData);
        }}>
          <label>Full name</label>
          <input name="name" required />
          <label>Email</label>
          <input name="email" type="email" required />
          <label>Phone</label>
          <input name="phone" />
          <label>Position applying for</label>
          <input name="position_applied" required />
          <button type="submit">Check in</button>
        </form>
      </div>
    </div>
  );
}