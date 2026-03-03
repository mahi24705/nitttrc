import CrudTablePage from "../components/CrudTablePage";

export default function GuestLectures() {
  return (
    <CrudTablePage
      title="Guest Lectures"
      subtitle="Guest Lecture Sessions"
      storageKey="guest_lectures_items_v1"
      columns={[
        { key: "speaker", label: "Speaker", className: "programme" },
        { key: "topic", label: "Topic", className: "muted" },
        { key: "mode", label: "Mode" },
      ]}
      formFields={[
        { key: "date", label: "Date (DD.MM.YYYY)", placeholder: "31.12.2025", required: true },
        { key: "speaker", label: "Speaker", placeholder: "Speaker name...", required: true },
        { key: "topic", label: "Topic", placeholder: "Lecture topic...", required: true },
        { key: "mode", label: "Mode", options: ["Contact", "Online", "Physical"] },
      ]}
      defaultForm={{ date: "", speaker: "", topic: "", mode: "Contact" }}
    />
  );
}