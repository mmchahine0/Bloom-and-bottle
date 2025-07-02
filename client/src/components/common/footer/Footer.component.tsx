import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";

interface FooterProps {
  content: {
    companyName?: string;
    description?: string;
    links: { label: string; path: string }[];
  };
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  const currentYear = new Date().getFullYear();
  const description =
    content?.description ?? "Luxury Perfume Decants & Samples";

  const whatsappNumber = "+961 76 913 342";
  const instagramHandle = "bloomandbottle.lb";

  return (
    <footer
      className="bg-[#2c2c2c] border-t font-serif tracking-wide text-[15px]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6 sm:flex-row sm:justify-between sm:space-y-0">
          {/* Company Information */}
          <div
            className="flex flex-col items-center sm:items-start space-y-2"
            aria-labelledby="company-info"
          >
            <h2
              id="company-info"
              className="text-xl font-bold text-white font-serif tracking-wide mb-1"
            >
              {"Bloom and bottle"}
            </h2>
            <p
              className="text-base text-white text-center sm:text-left max-w-md font-serif tracking-wide mb-2"
              aria-label="Company description"
            >
              {description}
            </p>
          </div>

          {/* Footer Navigation */}
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            <ul
              className="flex flex-wrap justify-center gap-x-6 gap-y-2"
              role="list"
            >
              <Link
                to={"/about"}
                className="text-sm text-white hover:text-gray-900 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[white] rounded-sm px-2 py-1 cursor-pointer"
                aria-label={`About us - Footer link`}
              >
                About Us
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\s+/g, "")}`}
                target="_blank"
                className="text-sm text-white hover:text-gray-900 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[white] rounded-sm px-2 py-1 cursor-pointer"
                aria-label={`Contact Us - Footer link`}
              >
                Contact Us
              </a>
            </ul>
          </nav>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 flex justify-center space-x-6">
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-900 transition-colors duration-150 ease-in-out flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[white] rounded-sm px-2 py-1 cursor-pointer"
            aria-label="Find us on Instagram"
          >
            <Instagram size={20} />
            <span className="text-sm">@{instagramHandle}</span>
          </a>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\s+/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-900 transition-colors duration-150 ease-in-out flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[white] rounded-sm px-2 py-1 cursor-pointer"
            aria-label="Contact us on WhatsApp"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{whatsappNumber}</span>
          </a>
        </div>

        {/* Copyright Notice */}
        <div
          className="mt-8 pt-6 border-t border-[#16C47F]/10"
          role="presentation"
        >
          <p
            className="text-center text-sm text-white"
            aria-label={`Copyright ${currentYear} ${"Bloom and bottle"}`}
          >
            <span aria-hidden="true">©</span> {currentYear} {"Bloom and bottle"}
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
