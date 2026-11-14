const features = [
  {
    icon: 'book',
    text: (
      <>
        Et kapitel
        <br />
        for hver dag
      </>
    ),
  },
  {
    icon: 'scissors',
    text: (
      <>
        En kreativ
        <br />
        stund sammen
      </>
    ),
  },
  {
    icon: 'quiz',
    text: (
      <>
        Dagens quiz
        <br />
        for voksne
      </>
    ),
  },
];
/* Displays the story, activity, and quiz features available behind each door. */
export default function FeatureStrip() {
  return (
    <div className="feature-section">
      <p className="eyebrow">Bag dagens låge finder du:</p>
      <div className="feature-strip">
        {features.map(
          /* Renders one feature’s icon and description. */
          (feature) => (
            <div className="feature" key={feature.icon}>
              <img src={`/assets/icons/${feature.icon}.webp`} alt="" />
              <p>{feature.text}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
