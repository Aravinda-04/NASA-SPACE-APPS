import type { LearningTask, MissionId } from "../types/expedition";
export const OPTIONAL_QUESTIONS: Record<MissionId, LearningTask> = {
  surveyor: {
    question:
      "Which record best supports an explanation of how the camera’s materials changed?",
    options: [
      "Laboratory tests of the returned hardware.",
      "An imagined painting of its future condition.",
      "The decorative completion seal.",
    ],
    correctIndex: 0,
    explanation:
      "Returned hardware can be measured and tested. A reconstruction helps explain form, but its painted wear is not evidence.",
  },
  curiosity: {
    question:
      "Why did the powered descent stage fly away after Curiosity touched down?",
    options: [
      "To return to Earth.",
      "To carry itself away from the rover after delivery.",
      "To bring back living microbes.",
    ],
    correctIndex: 1,
    explanation:
      "The descent stage had completed its delivery job. It flew away from the rover and impacted separately, leaving the laboratory ready for surface work.",
  },
  pioneer: {
    question:
      "What does a hypothetical 22h40m round trip at the 2003 distance describe?",
    options: [
      "Proof that Pioneer successfully replied in 2003.",
      "How long a controller waited for live video.",
      "Signal propagation in both directions at a fixed distance.",
    ],
    correctIndex: 2,
    explanation:
      "It doubles the one-way propagation delay. It excludes processing and moving endpoints, and does not establish a successful two-way communication event.",
  },
  viking: {
    question: "Why could a Viking biology response not be treated as proof of Martian life?",
    options: [
      "Chemical reactions can produce signals that require more than one explanation.",
      "The lander carried no scientific instruments.",
      "Every experiment returned exactly the same result.",
    ],
    correctIndex: 0,
    explanation:
      "A measured response is evidence, but scientists must compare biological and non-biological explanations before drawing a conclusion about life.",
  },
  ingenuity: {
    question: "Why did Ingenuity need to navigate much of each flight autonomously?",
    options: [
      "Mars was hidden from Earth during every flight.",
      "Communication delay prevents a pilot on Earth from steering it in real time.",
      "The helicopter could not communicate with Perseverance.",
    ],
    correctIndex: 1,
    explanation:
      "The Earth–Mars signal delay is far longer than a flight control reaction time, so onboard software stabilized and navigated each planned flight.",
  },
  near: {
    question: "How could NEAR touch down without purpose-built landing legs?",
    options: [
      "Eros' weak gravity allowed a very slow controlled descent.",
      "A dense asteroid atmosphere supported parachutes.",
      "The spacecraft landed in an ocean.",
    ],
    correctIndex: 0,
    explanation:
      "Eros has extremely weak gravity. Controllers used the spacecraft's thrusters to reduce its descent speed enough for a survivable contact with the surface.",
  },
  dawn: {
    question: "What made Dawn's two-destination orbital mission practical?",
    options: [
      "Efficient ion propulsion accumulated a large velocity change over long periods.",
      "A single chemical burn carried it instantly from Vesta to Ceres.",
      "Ceres and Vesta share the same orbit and regularly touch.",
    ],
    correctIndex: 0,
    explanation:
      "Dawn's ion engines produced low thrust very efficiently for long periods, enabling the extensive changes in velocity needed to orbit, depart and orbit again.",
  },
  kepler: {
    question: "Why must a possible transit repeat before its orbital period can be estimated?",
    options: [
      "The interval between matching dips measures how long the planet takes to orbit.",
      "The first dip contains no brightness information at all.",
      "Every star changes its distance from Earth once per hour.",
    ],
    correctIndex: 0,
    explanation:
      "A single dip can suggest an event, but repeated matching dips establish a cycle. Their time separation provides the candidate planet’s orbital period and helps reject false positives.",
  },
};
