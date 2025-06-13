// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from "react";

const App: React.FC = () => {
  const [activeEssay, setActiveEssay] = useState<number>(1);
  const [outlineAudioPlaying, setOutlineAudioPlaying] =
    useState<boolean>(false);
  const [essayAudioPlaying, setEssayAudioPlaying] = useState<boolean>(false);
  const [outlineAudioProgress, setOutlineAudioProgress] = useState<number>(0);
  const [essayAudioProgress, setEssayAudioProgress] = useState<number>(0);

  // Simulate audio progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (outlineAudioPlaying) {
      interval = setInterval(() => {
        setOutlineAudioProgress((prev) => {
          if (prev >= 100) {
            setOutlineAudioPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [outlineAudioPlaying]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (essayAudioPlaying) {
      interval = setInterval(() => {
        setEssayAudioProgress((prev) => {
          if (prev >= 100) {
            setEssayAudioPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [essayAudioPlaying]);

  // Format time from seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Essay content
  const essays = [
    {
      id: 1,
      title: "The Impact of Technology on Education",
      content: (
        <>
          <p className="mb-4">
            Technology has revolutionized the way education is delivered and
            received in the 21st century. From interactive smartboards to online
            learning platforms, the integration of technology in educational
            settings has transformed traditional teaching methods and expanded
            learning opportunities for students worldwide.
          </p>
          <p className="mb-4">
            One of the most significant impacts of technology on education is
            increased accessibility. Online courses and digital resources have
            made education available to individuals who may not have had access
            to traditional educational institutions due to geographical,
            financial, or physical limitations. This democratization of
            education has the potential to reduce educational inequality and
            provide opportunities for lifelong learning.
          </p>
          <p className="mb-4">
            Furthermore, technology has enabled personalized learning
            experiences. Adaptive learning software can assess a student's
            strengths and weaknesses and tailor educational content accordingly.
            This individualized approach allows students to learn at their own
            pace and focus on areas where they need the most improvement,
            potentially increasing engagement and retention.
          </p>
          <p className="mb-4">
            However, the integration of technology in education also presents
            challenges. The digital divide—the gap between those who have access
            to technology and those who do not—can exacerbate existing
            educational inequalities. Additionally, excessive screen time and
            digital distractions can negatively impact students' attention spans
            and cognitive development.
          </p>
          <p>
            In conclusion, while technology has transformed education in
            numerous positive ways, it is essential to address the challenges it
            presents and ensure that technological advancements benefit all
            students equally. The future of education lies in finding the right
            balance between technological innovation and traditional teaching
            methods to create optimal learning environments.
          </p>
        </>
      ),
    },
    {
      id: 2,
      title: "Climate Change: A Global Challenge",
      content: (
        <>
          <p className="mb-4">
            Climate change represents one of the most pressing challenges facing
            humanity in the 21st century. The scientific consensus is clear:
            human activities, particularly the burning of fossil fuels and
            deforestation, have led to an unprecedented increase in greenhouse
            gas emissions, resulting in global warming and associated climate
            disruptions.
          </p>
          <p className="mb-4">
            The impacts of climate change are already evident worldwide. Rising
            sea levels threaten coastal communities, while extreme weather
            events such as hurricanes, floods, and droughts have become more
            frequent and intense. These changes not only affect human
            populations but also disrupt ecosystems, leading to biodiversity
            loss and habitat destruction.
          </p>
          <p className="mb-4">
            Addressing climate change requires a multifaceted approach.
            Mitigation strategies aim to reduce greenhouse gas emissions through
            renewable energy adoption, improved energy efficiency, and
            sustainable land use practices. Adaptation measures help communities
            prepare for and respond to climate impacts that are already
            unavoidable.
          </p>
          <p className="mb-4">
            International cooperation is essential in combating climate change.
            The Paris Agreement, adopted in 2015, represents a significant step
            forward in global climate governance, with countries committing to
            limit global warming to well below 2 degrees Celsius above
            pre-industrial levels.
          </p>
          <p>
            In conclusion, climate change is a complex global challenge that
            requires immediate and sustained action. By implementing effective
            mitigation and adaptation strategies and fostering international
            collaboration, we can work toward a more sustainable and resilient
            future for generations to come.
          </p>
        </>
      ),
    },
    {
      id: 3,
      title: "The Ethics of Artificial Intelligence",
      content: (
        <>
          <p className="mb-4">
            As artificial intelligence (AI) continues to advance at a rapid
            pace, ethical considerations surrounding its development and
            implementation have become increasingly important. AI systems are
            now making decisions that affect human lives in areas such as
            healthcare, criminal justice, and employment, raising questions
            about fairness, accountability, and transparency.
          </p>
          <p className="mb-4">
            One of the primary ethical concerns in AI is algorithmic bias. AI
            systems learn from historical data, which may contain existing
            societal biases. Without careful design and oversight, these systems
            can perpetuate and even amplify discrimination against marginalized
            groups. Ensuring fairness in AI requires diverse development teams,
            representative training data, and robust testing for bias.
          </p>
          <p className="mb-4">
            Privacy is another significant ethical issue in AI. Many AI
            applications rely on vast amounts of personal data, raising concerns
            about surveillance, data security, and informed consent. Striking
            the right balance between data utilization for AI advancement and
            protecting individual privacy rights remains a challenge.
          </p>
          <p className="mb-4">
            The question of accountability also looms large in AI ethics. As AI
            systems become more autonomous, determining responsibility when
            things go wrong becomes increasingly complex. Should it be the
            developer, the user, or the AI system itself that bears
            responsibility for harmful outcomes?
          </p>
          <p>
            In conclusion, as AI continues to transform society, establishing
            ethical frameworks and governance mechanisms is essential. By
            addressing issues of bias, privacy, and accountability, we can
            harness the potential of AI while minimizing its risks, ensuring
            that this powerful technology serves humanity's best interests.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-book-open text-indigo-600 text-2xl mr-3"></i>
            <h1 className="text-xl font-semibold text-gray-900">
              Essay Writing Guide
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Part 1: Essay Outline Guide */}
        <section className="mb-16 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
                Essay Outline Guide
              </h2>

              {/* Audio Player for Outline */}
              <div className="w-full md:w-auto bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-4">
                <button
                  onClick={() => setOutlineAudioPlaying(!outlineAudioPlaying)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer !rounded-button whitespace-nowrap"
                >
                  <i
                    className={`fas ${outlineAudioPlaying ? "fa-pause" : "fa-play"} text-indigo-600`}
                  ></i>
                </button>
                <div className="flex-1">
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mb-1">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${outlineAudioProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-white">
                    <span>{formatTime(outlineAudioProgress * 0.3)}</span>
                    <span>5:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src="https://readdy.ai/api/search-image?query=A%20professional%20desk%20setup%20with%20notebooks%2C%20pens%2C%20and%20a%20laptop%20showing%20an%20essay%20outline.%20The%20scene%20is%20well-lit%20with%20natural%20light%2C%20featuring%20a%20minimalist%20aesthetic%20with%20white%20and%20light%20wood%20tones.%20A%20cup%20of%20coffee%20sits%20nearby%2C%20creating%20a%20productive%20study%20environment&width=600&height=400&seq=1&orientation=landscape"
                  alt="Essay writing workspace"
                  className="w-full h-auto rounded-lg shadow-md object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  The Essential Structure
                </h3>
                <p className="text-gray-600 mb-6">
                  A well-structured essay follows a clear format that guides
                  readers through your argument logically and persuasively.
                  Follow this outline to create compelling essays that engage
                  your audience and effectively communicate your ideas.
                </p>

                <div className="space-y-6">
                  {/* Introduction Section */}
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                      <i className="fas fa-flag text-indigo-500 mr-2"></i>
                      Introduction
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
                      <li>Hook to grab reader's attention</li>
                      <li>Background information on the topic</li>
                      <li>
                        Clear thesis statement that presents your argument
                      </li>
                    </ul>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                      <i className="fas fa-paragraph text-indigo-500 mr-2"></i>
                      Body Paragraphs
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
                      <li>
                        Topic sentence that introduces the paragraph's main idea
                      </li>
                      <li>Supporting evidence and examples</li>
                      <li>
                        Analysis that explains how evidence supports your thesis
                      </li>
                      <li>Transition to the next paragraph</li>
                    </ul>
                  </div>

                  {/* Conclusion */}
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                      <i className="fas fa-check-circle text-indigo-500 mr-2"></i>
                      Conclusion
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
                      <li>Restate thesis in a fresh way</li>
                      <li>Summarize key points from body paragraphs</li>
                      <li>Final thought or call to action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Tips */}
            <div className="mt-10 bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-700 mb-4">
                Pro Tips for Effective Essays
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded shadow-sm">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-lightbulb text-yellow-500 text-xl mr-2"></i>
                    <h4 className="font-medium text-gray-800">Clarity</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use clear, concise language and avoid unnecessary jargon.
                    Each sentence should contribute to your overall argument.
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-link text-blue-500 text-xl mr-2"></i>
                    <h4 className="font-medium text-gray-800">Cohesion</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ensure smooth transitions between paragraphs and ideas. Your
                    essay should flow logically from beginning to end.
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-search text-green-500 text-xl mr-2"></i>
                    <h4 className="font-medium text-gray-800">Evidence</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Support claims with relevant evidence. Use a mix of
                    examples, statistics, and expert opinions to strengthen your
                    argument.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Part 2: Sample Essays */}
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Sample Essays
            </h2>

            {/* Essay Selector */}
            <div className="relative w-full md:w-64">
              <div className="relative">
                <select
                  value={activeEssay}
                  onChange={(e) => setActiveEssay(parseInt(e.target.value))}
                  className="block w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg py-3 px-4 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer !rounded-button whitespace-nowrap"
                >
                  <option value={1}>Essay 1: Technology & Education</option>
                  <option value={2}>Essay 2: Climate Change</option>
                  <option value={3}>Essay 3: AI Ethics</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Audio Player for Essay */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 flex items-center space-x-4">
              <button
                onClick={() => setEssayAudioPlaying(!essayAudioPlaying)}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-md cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i
                  className={`fas ${essayAudioPlaying ? "fa-pause" : "fa-play"}`}
                ></i>
              </button>
              <div className="flex-1">
                <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${essayAudioProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(essayAudioProgress * 0.3)}</span>
                  <span>4:30</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                Audio for Essay {activeEssay}
              </div>
            </div>

            {/* Essay Content */}
            <div className="essay-content">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-blue-600 mr-3"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  {essays.find((e) => e.id === activeEssay)?.title}
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 text-gray-700 leading-relaxed space-y-4">
                  {essays.find((e) => e.id === activeEssay)?.content}
                </div>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h4 className="text-blue-800 font-medium mb-3 flex items-center">
                      <i className="fas fa-lightbulb text-blue-500 mr-2"></i>
                      Key Strengths
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>Clear thesis statement</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>Well-structured paragraphs</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>Strong supporting evidence</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>Effective conclusion</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h4 className="text-gray-800 font-medium mb-3 flex items-center">
                      <i className="fas fa-search text-indigo-500 mr-2"></i>
                      Analysis Notes
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      This essay effectively presents a balanced view of the
                      topic, considering multiple perspectives while maintaining
                      a clear position.
                    </p>
                    <p className="text-sm text-gray-600">
                      The author uses a variety of evidence types and
                      transitions smoothly between ideas, creating a cohesive
                      argument.
                    </p>
                  </div>

                  <img
                    src={`https://readdy.ai/api/search-image?query=Abstract concept illustration related to ${essays.find((e) => e.id === activeEssay)?.title}. Minimalist design with soft colors and geometric shapes on a light background. Professional, educational, and visually appealing illustration suitable for an academic website&width=400&height=300&seq=${activeEssay + 10}&orientation=landscape`}
                    alt={`Illustration for ${essays.find((e) => e.id === activeEssay)?.title}`}
                    className="w-full h-auto rounded-lg shadow-md object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-book-open mr-2"></i>
                Essay Writing Guide
              </h3>
              <p className="text-sm text-gray-400">
                Helping students master the art of essay writing with
                comprehensive guides and examples.
              </p>
            </div>
            <div>
              <h4 className="text-white text-base font-medium mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                    Writing Resources
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                    Grammar Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                    Citation Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                    Writing Prompts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-base font-medium mb-4">
                Contact Us
              </h4>
              <div className="space-y-3 text-sm">
                <p className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-3 text-gray-400"></i>
                  <span>support@essayguide.com</span>
                </p>
                <p className="flex items-start">
                  <i className="fas fa-phone-alt mt-1 mr-3 text-gray-400"></i>
                  <span>+1 (555) 123-4567</span>
                </p>
              </div>
              <div className="mt-4 flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <i className="fab fa-facebook"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; 2025 Essay Writing Guide. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
