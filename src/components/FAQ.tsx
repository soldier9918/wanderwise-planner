import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is a package holiday?",
    answer:
      "A package holiday bundles your flights, hotel, and sometimes transfers or extras into one booking. It's a convenient way to save time and money, as providers often offer discounted rates when you book everything together.",
  },
  {
    question: "How does FareFinder compare prices?",
    answer:
      "FareFinder searches across all major travel brands — including TUI, Jet2holidays, easyJet holidays, loveholidays, and more — to show you the best available prices side by side, so you never overpay.",
  },
  {
    question: "Are package holidays cheaper than booking separately?",
    answer:
      "In many cases, yes. Travel providers negotiate bulk rates on flights and hotels, passing the savings on to you. Package holidays also often include extras like airport transfers and baggage, which can add up when booked individually.",
  },
  {
    question: "Can I customise my package holiday?",
    answer:
      "Absolutely. Most providers let you choose your preferred hotel, flight times, room type, and board basis. Some also offer add-ons like car hire, excursions, and travel insurance.",
  },
  {
    question: "Is my money protected when booking a package holiday?",
    answer:
      "Yes. Package holidays booked through ATOL-protected providers are financially protected, meaning you're covered if the company goes out of business. Always check for the ATOL logo when booking.",
  },
  {
    question: "Can I make changes or cancel my booking?",
    answer:
      "This depends on the provider and the fare type you've chosen. Many providers allow free changes within a certain window, while others may charge a small amendment fee. Cancellation policies vary, so always check the terms before booking.",
  },
  {
    question: "What are the most popular package holiday destinations?",
    answer:
      "Some of the most popular destinations include Spain (Lanzarote, Tenerife, Majorca), Greece (Santorini, Crete), Turkey (Antalya), and further afield destinations like the Maldives, Dubai, and Bali.",
  },
  {
    question: "What's included in the baggage allowance?",
    answer:
      "Baggage allowances vary by airline and package provider. Most package holidays include at least one checked bag per person (usually 15–23kg), plus hand luggage. Check your specific booking for details.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about finding the best holiday deals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
