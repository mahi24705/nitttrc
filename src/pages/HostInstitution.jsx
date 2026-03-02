import CrudTablePage from "../components/CrudTablePage";

export default function HostInstitution() {
  return (
    <CrudTablePage
      title="Host Institution"
      subtitle="Host Institution Activities"
      storageKey="host_institution_items_v1"
      columns={[
        { key: "activity", label: "Activity", className: "programme" },
        { key: "details", label: "Details", className: "muted" },
      ]}
      formFields={[
        { key: "date", label: "Date (DD.MM.YYYY)", required: true },
        { key: "activity", label: "Activity", required: true },
        { key: "details", label: "Details" },
      ]}
      defaultForm={{ date: "", activity: "", details: "" }}
    />
  );
}