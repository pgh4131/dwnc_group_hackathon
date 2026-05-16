export default function FormField({
  children,
  error,
  hint,
  id,
  label,
  required = false,
}) {
  return (
    <label className="form-field" htmlFor={id}>
      <span className="form-label">
        {label}
        {required ? <em>필수</em> : null}
      </span>
      {children}
      {hint ? <span className="form-hint">{hint}</span> : null}
      {error ? (
        <span className="form-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
