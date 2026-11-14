/* Renders a decorative star hidden from assistive technology. */
export default function Ornament() {
  return (
    <span className="ornament" aria-hidden="true">
      ✧
    </span>
  );
}
