# Sabio

**By Marvin Rivera and Will Baker**

## Inspiration

Sabio was created to fill the void left by mediocre language-learning apps that don't actually help you learn, the main offender being the market leader Duolingo. Developed by two future K-12 educators, one of whom speaks Spanish natively and one of whom has been learning for years, it is designed to center around better pedagogy. We wanted an app that would help the user think about how and why language works rather than just learning random vocab.

## What it does

Sabio is a mobile app where users learn from three features: Lessons, Practice, and Dillow Chat.

The mobile app's lessons start with the core fundamentals, such as the alphabet, grammar rules, and basic linguistic theory behind the language. Practice content starts new learners on the most important phrases, the first of which being "¿Cómo se dice...?," or, "How do you say...?" and "¿Qué significa...? meaning "What does ____ mean?" Users have the options to comment on these phrases to ask natives about them, such as whether they use the phrases and when. Also part of the practice page are minigames which encourage the reinforcement of vocabulary through repeated practice.

Lastly, Dillow is an AI bot designed to encourage users to speak Spanish aloud using the grammar skills they've acquired combined with vocab they learn from practice, and new vocab that Dillow throws at them. The user is encouraged to speak Spanish, but can ask questions in English for clarification when necessary. While this is a really helpful tool, we understand that not everyone wants to speak to an AI bot, and that is ok! We encourage employment of these skills with other humans, too, but the most important part is just practicing.

## How we built it

Sabio was built using TypeScript and React, leveraging React Native to make it suited for mobile. It is styled with CSS and uses a postgres database hosted on Supabase to store user information and public comments on posts. Dillow, the AI bot, is implemented entirely using ElevenLabs, which provides speech-to-text, LLM responses, and human-like text-to-speech using a bot designed to sound like a natural native speaker, yet still clear for learners to understand. We leveraged Generative AI (Claude) to enhance the app UI while avoiding a common AI app appearance and maintaining a human feel to navigation and learning.

## Challenges we ran into

The main difficulties with making the app were:

- Writing lessons that met our standards for covering the fundamentals of the Spanish language, while keeping them concise and not boring. Part of the design approach was making lessons quick and easy so that users could go straight to practicing their new knowledge. This was difficult at times while writing lessons because it involved striking a balance between too much and too little information and covering topics that are much more difficult to a new learner than they are to us, since we both have years of experience.
- Tuning Dillow to enhance learning. Generative AI, and specifically the ElevenLabs LLM, is not designed to be a learning tool. This means that it does not employ better pedagogical skills or try to enhance user knowledge acquisition without being carefully told to do so. We also needed the bot to speak at the level the users seemed to be at, which was difficult, since the LLM often wanted to say much more than an A1-B2 Level of knowledge would allow.

## Accomplishments that we're proud of

The biggest accomplishment was making an app that we would actually want to use. With further development, it could be a fully fleshed-out language learning app that we are confident would boost our understanding of whatever language we're pursuing. While one of us already speaks Spanish, we'd like to expand to other languages in the future.

## What we learned

We are both taking a Mobile App Development course this semester, but thus far we have only used Android Studio to develop. This app gave us the opportunity to learn a new and commonly used tool, React Native. We ended up liking it a lot better!

This was also our first time using Generative AI as a feature in an app. It was especially new to us because we used voice features, which opened up a whole realm of new questions we had to answer. Which voice would be best? How should we manage speech to text, text to speech, and translations? There was a lot that was new to us, but ElevenLabs was an amazing, easy to use tool for our first time.

## What's next for Sabio

We're so happy with how Sabio came out that we want to continue to develop Sabio and get it released on the app stores. It will take months or even years before we have a full curriculum, since as we learned, making learning content takes time. Additionally, we would love to expand to other languages, though we will need developers fluent in them to design content.

Lastly, we also envisioned a social page when we came up with the app, and we'd love to bring that to life. Ideally, this would be a platform to share videos with the intent being users could watch videos made in their target language. Youtubers could get more engagement by posting videos there and learners could learn from those videos, making it a mutualistic system. To accompany the videos, we would like to add live captions using ElevenLabs to help users understand the videos in another form, too.

## Built With

- ElevenLabs
- React Native
- TypeScript
- Supabase
- Expo
