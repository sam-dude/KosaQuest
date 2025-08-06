import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/mongodb";
import Story from "../models/Story";

dotenv.config();

const sampleStories = [
  {
    storyId: "001",
    title: "The Tortoise and the Drum",
    description: "A classic Yoruba tale about wisdom and patience",
    language: "Yoruba",
    difficulty: "beginner" as const,
    pages: [
      {
        pageNo: 1,
        english:
          "Once upon a time, in a village far away, there lived a wise tortoise named Ijapa.",
        native:
          "Ni igba kan, ni abule kan ti o jinna, ijapa ologbon kan wa ti a npe ni Ijapa.",
      },
      {
        pageNo: 2,
        english:
          "One day, Ijapa heard the sound of a magical drum echoing through the forest.",
        native:
          "Ni ojo kan, Ijapa gbo ariwo ilu idan kan ti o nkigbe ninu igbo.",
      },
      {
        pageNo: 3,
        english:
          "The drum belonged to the spirits, and whoever played it would receive great wisdom.",
        native:
          "Ilu naa ti awon emi ni, ati pe enikeni ti o ba lu u yoo gba ogbon nla.",
      },
      {
        pageNo: 4,
        english:
          "But the drum could only be played by someone with a pure heart and patience.",
        native:
          "Sugbon ilu naa le lu nipasẹ ẹni ti o ni ọkan mimo ati suuru nikan.",
      },
    ],
    quizzes: [
      {
        questionId: "q1",
        question: "What was the tortoise's name?",
        options: ["Ijapa", "Anansi", "Kulu", "Baba"],
        answer: "Ijapa",
        points: 10,
      },
      {
        questionId: "q2",
        question: "What would the drum give to whoever played it?",
        options: ["Gold", "Wisdom", "Power", "Fame"],
        answer: "Wisdom",
        points: 15,
      },
      {
        questionId: "q3",
        question: "Complete the proverb: 'Patience is...'",
        options: [
          "bitter but its fruit is sweet",
          "a virtue",
          "key to success",
          "all of the above",
        ],
        answer: "bitter but its fruit is sweet",
        points: 20,
      },
    ],
    totalXP: 45,
  },
  {
    storyId: "002",
    title: "The Clever Rabbit",
    description: "A tale of wit and intelligence from Hausa folklore",
    language: "Hausa",
    difficulty: "beginner" as const,
    pages: [
      {
        pageNo: 1,
        english:
          "In the savanna lived a clever rabbit who was known for his quick thinking.",
        native:
          "A cikin savanna akwai wani zomo mai wayo wanda aka sani da saurin tunani.",
      },
      {
        pageNo: 2,
        english: "One day, the rabbit met a hungry lion who wanted to eat him.",
        native:
          "Wata rana, zomo ya hadu da zaki mai yunwa wanda yake son cinye shi.",
      },
      {
        pageNo: 3,
        english:
          "Using his wit, the rabbit convinced the lion that he knew where to find better prey.",
        native:
          "Da yake amfani da wayonsa, zomo ya shawo kan zaki cewa ya san inda za a sami ganima mafi kyau.",
      },
    ],
    quizzes: [
      {
        questionId: "q1",
        question: "What was the rabbit known for?",
        options: ["Speed", "Quick thinking", "Singing", "Dancing"],
        answer: "Quick thinking",
        points: 10,
      },
      {
        questionId: "q2",
        question: "Who did the rabbit meet?",
        options: ["A tiger", "A hungry lion", "An elephant", "A bird"],
        answer: "A hungry lion",
        points: 15,
      },
    ],
    totalXP: 25,
  },
  {
    storyId: "003",
    title: "The Magic Pot",
    description: "An Igbo story about kindness and sharing",
    language: "Igbo",
    difficulty: "intermediate" as const,
    pages: [
      {
        pageNo: 1,
        english:
          "There was once a poor woman who found a magic pot in the forest.",
        native:
          "Otu mgbe, enwere nwanyị ogbenye nke chọtara ite anwansi n'ọhịa.",
      },
      {
        pageNo: 2,
        english:
          "The pot could cook delicious food without fire or ingredients.",
        native:
          "Ite ahụ nwere ike isi nri na-atọ ụtọ na-enweghị ọkụ ma ọ bụ ihe ndị e ji esi nri.",
      },
    ],
    quizzes: [
      {
        questionId: "q1",
        question: "Where did the woman find the pot?",
        options: ["Market", "Forest", "River", "Mountain"],
        answer: "Forest",
        points: 15,
      },
    ],
    totalXP: 15,
  },
];

const seedStories = async () => {
  try {
    await connectDB();

    console.log("🌱 Seeding stories...");

    // Clear existing stories
    await Story.deleteMany({});
    console.log("🗑️  Cleared existing stories");

    // Insert sample stories
    const createdStories = await Story.insertMany(sampleStories);
    console.log(`✅ Created ${createdStories.length} stories`);

    console.log("🎉 Stories seeded successfully!");

    // Display created stories
    createdStories.forEach((story) => {
      console.log(
        `📖 ${story.title} (${story.storyId}) - ${story.language} - ${story.totalXP} XP`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding stories:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedStories();
}

export default seedStories;
