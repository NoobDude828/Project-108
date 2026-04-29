const cards: [string, string, string][] = [
  ["Confirmed", "Site", "The site stretches over 12 km along the Mau Chhu."],
  [
    "Locked",
    "Design",
    "The project is proceeding with the Jangchub Chorten design.",
  ],
  [
    "Underway",
    "Engineering",
    "Technical planning and foundation preparation are already active.",
  ],
  [
    "In Progress",
    "Materials & Vendors",
    "Sourcing and vendor discussions are in full swing.",
  ],
  [
    "Active",
    "Spiritual Guidance",
    "Eminent Buddhist masters are already involved in the project.",
  ],
  [
    "Ongoing",
    "Global Conversations",
    "The project welcomes dialogue with supporters from around the world.",
  ],
];

export default function ReadinessCards() {
  return (
    <div className="p108-readiness">
      {cards.map(([badge, title, body]) => (
        <div className="p108-card" key={title}>
          <div className="p108-card__badge">{badge}</div>
          <h3 className="p108-card__title">{title}</h3>
          <p className="p108-card__body">{body}</p>
        </div>
      ))}
    </div>
  );
}
