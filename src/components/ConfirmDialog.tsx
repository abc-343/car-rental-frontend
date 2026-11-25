interface ConfirmDialogProps {
  title: string;
  message: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Popup asking the user to confirm before deleting something
export function ConfirmDialog({ title, message, deleting, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting} autoFocus>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
