import CrudTablePage from "../components/CrudTablePage";

export default function Workshops() {
  return (
    <CrudTablePage
      title="Workshops"
      subtitle="Workshops / Training / Events"
      storageKey="workshops_items_v1"
      columns={[
        { key: "topic", label: "Topic", className: "programme" },
        { key: "duration", label: "Duration", className: "muted" },
        { key: "mode", label: "Mode" },
      ]}
      formFields={[
        { key: "date", label: "Date (DD.MM.YYYY)", placeholder: "31.12.2025", required: true },
        { key: "topic", label: "Topic", placeholder: "Workshop topic...", required: true },
        { key: "duration", label: "Duration", placeholder: "01.01.2026 - 02.01.2026" },
        { key: "mode", label: "Mode", options: ["Contact", "Online", "Physical"] },
      ]}
      defaultForm={{ date: "", topic: "", duration: "", mode: "Contact" }}
    />
  );
}