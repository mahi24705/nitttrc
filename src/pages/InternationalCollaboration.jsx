import CrudTablePage from "../components/CrudTablePage";

export default function InternationalCollaboration() {
  return (
    <CrudTablePage
      title="International Collaboration"
      subtitle="MoU / Collaborations / Partnerships"
      storageKey="intl_collab_items_v1"
      columns={[
        { key: "partner", label: "Partner", className: "programme" },
        { key: "details", label: "Details", className: "muted" },
      ]}
      formFields={[
        { key: "date", label: "Date (DD.MM.YYYY)", placeholder: "31.12.2025", required: true },
        { key: "partner", label: "Partner", placeholder: "University/Org name...", required: true },
        { key: "details", label: "Details", placeholder: "MoU / Work / Notes..." },
      ]}
      defaultForm={{ date: "", partner: "", details: "" }}
    />
  );
}