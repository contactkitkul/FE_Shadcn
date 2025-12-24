// CRUD Components - Reusable patterns for dashboard pages
export { CrudPage, useCrudPageState } from "./crud-page";
export type {
  CrudPageProps,
  CrudColumn,
  CrudFilter,
  CrudActions,
  ExportConfig,
} from "./crud-page";

export { DetailDialog, InfoGrid, ItemList } from "./detail-dialog";
export type {
  DetailDialogProps,
  DetailSection,
  DetailField,
  DetailAction,
  InfoGridProps,
  ItemListProps,
} from "./detail-dialog";
