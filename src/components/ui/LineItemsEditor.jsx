export default function LineItemsEditor({ label, items, onChange }) {
  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: field === "amount" ? Number(value) : value };
    onChange(next);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, { title: "", amount: 0 }]);
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item.title}
              onChange={(event) => updateItem(index, "title", event.target.value)}
              placeholder="Title"
              className="flex-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard"
            />
            <input
              type="number"
              value={item.amount}
              onChange={(event) => updateItem(index, "amount", event.target.value)}
              placeholder="Amount"
              className="w-28 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-sm font-semibold text-stamp-red hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-sm font-semibold text-ink hover:underline"
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}
