import CrudTablePage from "../components/CrudTablePage";

export default function Pg() {
  return (
    <CrudTablePage
      title="PG"
      subtitle="Post Graduate Programmes"
      storageKey="pg_items_v1"
      columns={[
        { key: "code", label: "Code", className: "code" },
        { key: "title", label: "Programme", className: "programme" },
        { key: "duration", label: "Duration", className: "muted" },
        { key: "mode", label: "Mode" },
      ]}
      formFields={[
        { key: "date", label: "Date (DD.MM.YYYY)", required: true },
        { key: "code", label: "Code", required: true },
        { key: "title", label: "Title", required: true },
        { key: "duration", label: "Duration" },
        { key: "mode", label: "Mode", options: ["Contact", "Online", "Physical"] },
      ]}
      defaultForm={{ date: "", code: "", title: "", duration: "", mode: "Contact" }}
    />
  );
}