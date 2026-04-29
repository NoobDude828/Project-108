function StatStrip() {
  const stats = [
    ['108', 'Chortens'],
    ['15 m', 'Height'],
    ['108 m', 'Spacing'],
    ['1.62 km', 'Stacked Height'],
  ];
  return (
    <div className="p108-stats">
      {stats.map(([v, l]) => (
        <div className="p108-stat" key={l}>
          <div className="p108-stat__value">{v}</div>
          <div className="p108-stat__label">{l}</div>
        </div>
      ))}
    </div>
  );
}
window.StatStrip = StatStrip;
