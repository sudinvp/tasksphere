export default function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ui-card modal-card">{children}</div>
    </div>
  );
}
