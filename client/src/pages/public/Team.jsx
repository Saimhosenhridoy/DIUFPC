 // src/pages/public/Team.jsx

import { advisors } from "../../data/advisors.js";
import { committeeSessions } from "../../data/committee.js";

function PhotoCard({ person }) {
  return (
    <div className="team-photoCard">
      <img
        src={person.photo}
        alt={person.name}
        className="team-photoCardImg"
        loading="lazy"
      />

      {/* overlay */}
      <div className="team-photoCardOverlay" />

      {/* content */}
      <div className="team-photoCardContent">
        <h3 className="team-photoCardName">{person.name}</h3>
        <div className="team-photoCardRole">
          {person.role}
        </div>
        {person.dept && (
          <div className="team-photoCardDept">
            Dept. of {person.dept}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Our Team
          </h1>
          <div className="contact-underline mx-auto mt-4" />
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Advisors and Executive Committee of DIU Film & Photography Club
          </p>
        </div>

        {/* ADVISORS */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Advisors</h2>
            <div className="contact-underline mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {advisors.map((a, i) => (
              <PhotoCard key={i} person={a} />
            ))}
          </div>
        </section>

        {/* COMMITTEE */}
        {committeeSessions.map((group, idx) => (
          <section key={idx}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">
                {group.title}
              </h2>
              <p className="mt-1 text-slate-600 font-medium">
                Session {group.session}
              </p>
              <div className="contact-underline mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {group.members.map((m, i) => (
                <PhotoCard key={i} person={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
