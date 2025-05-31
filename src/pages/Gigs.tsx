
import React from 'react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

// Define the gig type
interface Gig {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

const Gigs = () => {
  // Sample gig data
  const gigs: Gig[] = [
    {
      id: 1,
      title: "Custom Website Design",
      description: "Get a fully custom website design that reflects your brand and meets your business goals. Includes 5 unique page designs and unlimited revisions.",
      price: "Starting at $1,200",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=400",
      category: "Design"
    },
    {
      id: 2,
      title: "Frontend Development",
      description: "Convert your design into a fully responsive, fast-loading website with modern web technologies like React, Vue, or plain HTML/CSS/JS.",
      price: "Starting at $1,500",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&h=400",
      category: "Development"
    },
    {
      id: 3,
      title: "UI/UX Consultation",
      description: "Improve your existing website or app with a comprehensive UI/UX review and actionable recommendations for better user experience.",
      price: "$150/hour",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=600&h=400",
      category: "Consultation"
    },
    {
      id: 4,
      title: "Full-stack Web Application",
      description: "Get a complete web application with front-end, back-end, and database integration. Ideal for startups and businesses needing custom solutions.",
      price: "Starting at $3,000",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&h=400",
      category: "Development"
    },
    {
      id: 5,
      title: "Logo & Brand Identity",
      description: "Develop a professional brand identity including logo design, color palette, typography, and basic brand guidelines.",
      price: "Starting at $800",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&h=400",
      category: "Design"
    },
    {
      id: 6,
      title: "Website Maintenance",
      description: "Keep your website secure, updated, and running smoothly with regular maintenance, backups, and technical support.",
      price: "$200/month",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=600&h=400",
      category: "Maintenance"
    }
  ];

  // Categories for filtering
  const categories = ["All", "Design", "Development", "Consultation", "Maintenance"];
  const [activeCategory, setActiveCategory] = React.useState("All");
  
  // Filtered gigs based on active category
  const filteredGigs = activeCategory === "All" 
    ? gigs 
    : gigs.filter(gig => gig.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-medium mb-6">
            My <span className="highlight">Services</span>
          </h1>
          <p className="text-xl text-light/70 mb-8 max-w-2xl mx-auto">
            I offer a range of professional services to help you establish a strong online presence and create impactful digital experiences.
          </p>
        </div>
      </section>

      {/* Gigs Section */}
      <section className="section">
        <div className="max-w-6xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full transition-colors ${
                  activeCategory === category 
                    ? "bg-highlight text-dark" 
                    : "bg-secondary hover:bg-light/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Gigs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGigs.map(gig => (
              <div 
                key={gig.id} 
                className="bg-secondary rounded-lg overflow-hidden flex flex-col hover:transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="h-56 overflow-hidden">
                  <img 
                    src={gig.image} 
                    alt={gig.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-dark text-light/70">
                      {gig.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">{gig.title}</h3>
                  <p className="text-light/70 mb-4 flex-grow">{gig.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-highlight font-medium">{gig.price}</span>
                    <a 
                      href={`/contact?service=${encodeURIComponent(gig.title)}`}
                      className="px-4 py-2 bg-dark text-light hover:bg-light/10 transition-colors rounded"
                    >
                      Inquire Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No results message */}
          {filteredGigs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-light/70">No services found in this category.</p>
            </div>
          )}
          
          {/* Custom Request */}
          <div className="mt-20 bg-dark border border-light/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl md:text-3xl mb-4">Need Something <span className="highlight">Custom</span>?</h2>
            <p className="text-light/70 mb-6 max-w-2xl mx-auto">
              Don't see exactly what you're looking for? I'm happy to discuss custom projects and find the perfect solution for your specific needs.
            </p>
            <Link 
              to="/contact"
              className="px-8 py-3 bg-highlight text-dark font-medium rounded hover:opacity-90 transition-opacity inline-block"
            >
              Request a Custom Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-12 text-center">Client <span className="highlight">Testimonials</span></h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                text: "Working with DetHiaNh was a fantastic experience. They delivered a website that exceeded our expectations and truly captures our brand essence.",
                author: "Jane Cooper",
                position: "CEO, Design Studio"
              },
              {
                text: "The attention to detail and technical expertise provided was exceptional. Our e-commerce site has seen a significant increase in conversions since the redesign.",
                author: "Michael Johnson",
                position: "Marketing Director, Retail Brand"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-dark p-6 rounded-lg">
                <svg className="w-10 h-10 text-highlight mb-4 opacity-50" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 8v10c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4zm18 0v10c0 2.2-1.8 4-4 4h-2c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4z"/>
                </svg>
                <p className="text-light/80 mb-6 text-lg">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-light/50 text-sm">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="section">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-12 text-center">Frequently Asked <span className="highlight">Questions</span></h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What is your typical process for new projects?",
                answer: "My process typically starts with an initial consultation to understand your requirements, followed by research and planning, design concepts, development, testing, and finally launch with post-launch support."
              },
              {
                question: "How long does it take to complete a project?",
                answer: "Project timelines vary depending on complexity and scope. A simple website might take 2-4 weeks, while a more complex web application could take 2-3 months or more."
              },
              {
                question: "Do you offer ongoing maintenance and support?",
                answer: "Yes, I offer various maintenance packages to keep your website secure, updated, and performing optimally after launch."
              },
              {
                question: "What payment methods do you accept?",
                answer: "I accept payments via bank transfer, PayPal, and major credit cards. Projects typically require a 50% deposit upfront, with the remaining balance due upon completion."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-secondary p-6 rounded-lg">
                <h3 className="text-xl mb-3 font-medium">{faq.question}</h3>
                <p className="text-light/70">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-light/70 mb-6">
              Still have questions? Feel free to reach out directly.
            </p>
            <Link 
              to="/contact"
              className="px-6 py-3 bg-highlight text-dark font-medium rounded hover:opacity-90 transition-opacity inline-block"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gigs;
