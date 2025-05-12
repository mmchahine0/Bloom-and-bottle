import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/background.png.jpg";
import menPerfume from "@/assets/ManPerfume.png.jpg";
import femalePerfume from "@/assets/FemalePerfume.png.jpg";

type FeaturedItem = {
  _id: string;
  name: string;
  brand: string;
  price: number;
  sizes: number[];
  image: string;
  type: string;
};

type CollectionProduct = {
  _id: string;
  name: string;
  image: string;
};

type Collection = {
  _id: string;
  title: string;
  description: string;
  products: CollectionProduct[];
};

type Feedback = {
  _id: string;
  screenshot: string;
};

type HomepageData = {
  featuredItems: FeaturedItem[];
  collections: Collection[];
  feedbacks: Feedback[];
};

const dataArray = {
  success: true,
  data: {
    featuredItems: [
      {
        _id: "6638a1...",
        name: "Dior Sauvage",
        brand: "Dior",
        price: 150,
        sizes: [2, 5, 10],
        image:
          "https://shopandbeyondlb.com/cdn/shop/files/7020_278ded2a-b4c7-4a4a-b414-f0d15df64435.jpg?v=1743060118",
        type: "perfume",
      },
      {
        _id: "6638b2...",
        name: "Sample: Baccarat Rouge 540",
        brand: "Maison Francis Kurkdjian",
        price: 20,
        sizes: [1, 2],
        image:
          "data:image/jpeg;base64,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",
        type: "sample",
      },
    ],
    collections: [
      {
        _id: "summer-2024",
        title: "Summer Vibes Collection",
        description: "Light, fresh scents perfect for sunny days.",
        products: [
          {
            _id: "p1",
            name: "Versace Dylan Blue",
            image:
              "https://fattalbeauty.com/cdn/shop/files/202807_013cd5ad-ba3e-431c-882b-9ee3cb1c8596.png?v=1693855903",
          },
          {
            _id: "p2",
            name: "Chanel Chance Eau Fraîche",
            image:
              "data:image/jpeg;base64,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",
          },
        ],
      },
      {
        _id: "date-night",
        title: "Date Night Favorites",
        description: "Sophisticated and seductive scents.",
        products: [
          {
            _id: "p3",
            name: "Tom Ford Noir",
            image:
              "data:image/jpeg;base64,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",
          },
          {
            _id: "p4",
            name: "Yves Saint Laurent La Nuit",
            image:
              "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxATEBUQEhAQEhUQGBUQFxISEBEQEhYSFRQWFxUWFxUYHSkgGCYlHRUVITEhJSkrLi4uFx8zODgtNygtLi0BCgoKDg0OFRAQFyslHx0vLSstNSszKy8tMi83Ky0tKy4rLSswNy0xLS4rLSstLS0rNS0vKy0tOCstLSstLS0rK//AABEIALcBEwMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABwMEBQYIAgH/xABREAACAQIDAggGDAoIBwEAAAABAgADEQQSIQUxBgcTIkFRYYEycXKRssEUIzQ1QlJzdKGxs9EIJDNTVYKSlNPwFRclVGOTosNihKPC0uHjRP/EABoBAQEAAwEBAAAAAAAAAAAAAAABAwQFAgb/xAAvEQEAAQMCAwQJBQAAAAAAAAAAAQIDEQQxBSFBEhNhoRRxgZGSsdHh8CIyM0JR/9oADAMBAAIRAxEAPwCcYiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIkV7Q432psw9ghspI90kbjb83MSOPds6odmrzmC39mHpNvzMCaokIjj9b9GL++n+DPv9fjfowfvp/gwJtiQl/X436LH76f4Mf1+N+jB++n+DAm2JFmF44c6K3sC2YBreyb2uAbfk+2VTxtj+4n95/+cCTpb4zH0aQBq1aVINoDUqLTBPUCx1lTD1cyK9rZgGtvtcXkd8dnufD/ACjegYG6HhJgP77hP3mj/wCUJwiwJ0XGYVumwr0jp3Gc4TadiYLJRzkc6rzvEnwfPv7x1QJmbhHghvxeH/zk++Uzwq2eP/2Yf/NX75C+KmOffAnY8Ltnf3zD/wCYDPLcMdmjfjKH7UgcmeHMCczw/wBkfpDDdz3ng8Ymx/0hQ87fdObMdRyOQNx5y+LpHcfVLJpB1DT4wtjsbDaOGHlVMg87WmUwfCLA1fyWMwtTyMRSf6jOQMQde4fWZQIHUJR2ujgi4II6wbz1OKqFZkOZGZD1oxQ+cTbuAXCTH/0lg6ZxuLKPiKSMjYmsyMrOAQVLWItA6niIgIiICIiAiIgIiICIiAiIgcubd8N/Kb6zNVY+2p5aekJtW3/yj+U3pGapU/Kp5S+kJRQXdECJAiJ9gbds38inkJ6Ilw26W+zvyNPyF9ES4bcZUdLbP/I0/IT0RI/47Pc+H+Ub0DJBwH5Kn5C+iJH3HZ7nw/yregZFRpsLZ/L1ghHNHPfyB0d5sO+bhjzKfBjZ/I0MzCz1rOesL8BfMb/rGMe0DBY3W469Je8JaIKYXEqioMTh0ZggCqK6cysABpvA88sa4LMqqLs7LTUXtd3YKi36LsQO+bhitnqMA2HpMhOzcQyVK1alTqqEqDPXqKjA2AqFrLvOQa3MDUdlKtJGxdRVaxalQpuoZXrW51RlOjLTDDrBdlHwTMPVaZzbO08PXQZaJovSbIiofajhyXbVfguGIvlsGzk2mv4hrCBh9sVBYdYN/vmNYz1tOtmbsGktqL9HV9UkinifC7vvlKVsTv7vWZSgJneAXvrgfnND7QTBTO8AvfXA/OaH2ggddxEShERAREQEREBERAREQEREDmThLhKi1al6dQWd96MPhHsmmVtKi305ynXT4QnSfG9wuxGzsHTqYcJnrVRSzOM2VcjMSBuvzRv7ZDdfjQ2pUHus67wClPusbfXC4aSpn20zFbalSpvFK5uS2Si+vnP1TG1MHbU1UH7XT4ktBhRtGnSbT6uH00cN4iR9LATMbO25Wom6igD8a1BG/wBJ180GGU2Yb0ktrzV3eIS9XDu2io7HqVGJ+gTxh+NLaVLRcUlh0Cmj/wDYB9Mlbie4cYjaS11xAQth+TIdVyFg+feAbfA6OuXKYSDg1IpoDvCqPoE1HjJ2eK/sVGtlWq1RgelVTwe25I7rzdJHvHBjGophKq70rE26xyZBHeCR3yCwxTTBY55k6uIV0Dqbq4DA9hFxMFjHgWLVilRKi2zUqlOsoO4tSqLUUHsuovJUweGoYmktWgjPT2hiUq11dQQgpIWdGHUalEA7wS56CJElRpInAzbtKlg7535LBYd6mIQKQeWxFYuAD8IjLUAsfhQI/wBvVEbE1mpqqIaj5FRQqhASFsBoNAJr21atl8ek2nhVsoYbEPRVsyaPTbrpuLqT9XdNI21V6IGHqtKI0N56YypRS+vQuv3D+eowKeIOo8XrMpCVsUed3esyjIPszvAH32wPzmh6YmCme4A++2B+c0fTEDrqIiUIiICIiAiIgIiICIiAiIgRL+Eb7gw/zj/aqTnsidD/AIRFMtgsKqi5bEhQNBcmlUAGvbOfhh3OoViCpqDTei3DN4hY+YyvdOyjafLS4TB1SQopVCWAcAIxJQ7mAA1HbPhwlW4HJ1LklQMjXLDeALbx1QqhPtp65Jtea2l76HS2+/insYeplzZHy3CZsrZcxFwt91yNbQQpiTd+DWdcd/y3+990halh3a1lY5iFGm8sSFA8ZVh3GTh+DrhmptjlbLe2FJCsr290aEjceyQnZNEjPjzP4th/lW+zMkyRlx6e5sN8q32ZhjaLwV2jdGoMfBu6eSTzh3E3/WPVLjGNNSwuINN1dd6m/jHSO8XE2StWDAMNzC474FXZq4djUSu5plgvJVbFkRwWzCoo1IYFRcA2te0zibNalsmqhr4dfZuJC8qKq1VGHpIoJUISahFRX5uhubHLqRqTTOYvE0KmDwdAVhSOHptnVqdQjl6zZ6pBUG4zX1gY3hNtMV6xdQVRVWkisbkU6ahVv22Fz2kzRdqvzpvFfAYPKS20gCoJ5NMFWZmIFwodmULfdciaBjnuxgWsvCmUBe8+V/63eeU8JT1z/F3eV0ebf5pVaSRZ4nwu71mUjKmK8Lu9ZlGFerzPcAPfbA/OaPpia/M/xf8AvtgfnNH0xKjryIiAiIgIiICIiAiIgIiICIiBF3H6+XCYRyCQmKRyBvsqOZCqbURQuRSpoKyISAc2dBmLrew5y3IGlnPfN3H3RLYGiB0Vwf8ApvIOwNECtTJ0AdCSdwAYXJmGq5icOjp9J3lvtMtgNqYZaoqhzTAoLhRTKuzKQc+bMBYgeDfeTrYDWXGy9sopu2KWzU8TTFN2xIArPVqvTquUAyjI2XMpz8+265FPBphHZByagkquV+UyqAgUCw0YZhmIupOZtdRK9XA4G7mqXz2zBAMjIKgDLT0ADNT52+wN1GlrCd7D16DM8sSxGC2iq09alNgXx2eleuQ/KUCKXO8IqW08K+4ndcX1XbFHlKdZaoC0qFOmMOFrMOWQq4POBBUFV1LFroOjWXlHZOBNCmQOYxf25RUKkhgoZqjaqDlcW63B6JZ18JgFTRczKVBGaqC3tZzZTu8K3O+i2+zdxOEt6OaqYqxPNanbdBLcnSay2CiwAXIWKMNd/ttXzyVOIXECo+OqDlLH2MoDsGIAFfRbbhru8fXIfx1CndRT1CrYtlKlmzNqQezLpJd/B7p2TGdpofVVlpuZnBf0nd25qwl+Rjx6+5sN8q32ZknSMOPb3PhvlW+zMyuahyZHZ2MAUoxtbUX7d4/nrmOIO+x17OrfPBMis2cVT+OvnlCpik+OvnExOYTyWhFfFYlbHnDuMwVUEnQb5kmaU2aUeMoACjo6es9J/noAnhp6MpsZBaYvwu71mUJWxXhd3rMoyhM/xf8AvtgfnNH0xMBNg4vvfbA/OaPpiB13ERAREQEREBERAREQEREBERA0LjhS+EpD/F/23kLV8ML7pN3Gzb2NRv01rDx8m59Uh7F09Zx9XXMX5h9VweImx7ZWCYTQHKbG9jY2NrA2PTvHnlxTwy9kusHtWrTAVQhC3AzKW0Lh7b9OcqtcWN1GttJdYfbbgMuReeztoSLZqXJ2F77gN++Y559XVzXGcU+bX9g4dThqbaa5vTYS5qYYdX0S92Dwgf2JTXk6eiGlmsc2UIaVr+IX8Z6tJc1dv1mzaUxnzgnJckVDdhvsOgaDonu5/JVmrrLX0s3JsWv0/wBY6+DCLhx1SW+JSllGK7eR+qrIww1OSrxQsL4pQdVFAnsvytvqjTVzN+mPX8mrxeIjT1ez5pHkX8fB/F8N8q32ZkoSLePo/i+G+Vf7Odl8kjrZO0MMiIauZygq0jSVTmy1mUO+ZlK25PlFt4XP0ta8uMDj8NlNNnXMmGbDLWysqNncD2y4uuU2YN1OwO5RNVLS72Rj1pOzsubmrZSLgsK1Ju6wUsD1qJBm6+0VUUKIrU8qNgVqAMhS9LlRXJJ0IBVCW3EBTulvXdTh6eYUGqcovLvTODKZs9O18qktdMtzSYLmD5rkmU6G0MKbhV5C6omZVVKigBczq6m7kPTVrXBa5BvmulB8RgXy2pcmSD4RZlDNYFWa+oFyQ2ngm+8WKqUsPQzFK6mmVaugFOnTI5tEMC5vfpJFgddLWE+f0eHD8pRWg3gUMt1V8zLTRtTz1DNT9s6eUJJNtKOLGEzXNtcxIBZrljdcuQ2sNVtcHQX33lvWoYUMbEWFyMrMQwIAHO33B16Lg7hbUK77MoZhZ+bmDFr+FSRUV2Haah/1dkxO06ARgg3gLfRxzsik6kkHUndaWzmeXqE7yTbrJMItMTv7vWZSlXEb+71mUpQmw8Xo/tbA/OaPpiYBVmycXif2tgvnFI/TA61iIgIiICIiAiIgIiICIiAiIgaTxpYFq9LC4dMmatiLKXF1BWhWqX8yGaLW4G4tVPK0HXLpmpXxSt2jLzwPKUSV+E+x3xCUjTcU6uGqjEU2Zc6k5HpsrC43pUcXvobHolJce9Pm1aVUWHhCmzqe9L/TNa/p6bu/KW5ptZcsftQpW2PTDZTiKat8ViqN+yWvPo2C3RUQ+Ir98nMY+i4GZWIPx6T5fOwtKL4DAMdcPhGJ66NEnXumlPD7nS55Q6dPG6utPn9kFbO4LVKdJUNRSVvutbVievtlwuwwDZq1MHqLID9LSahs/Zy6ihgh4qNAeqXNPFYZPACC35qnf0BLOgu1TMzd38Pu808YmimKaaOUct0QUOCOJYe1UK1W+mawo0/GXZhceSDNw4rNj1cJWxdCqtNWK4atamxfmscQozOQCxuh367vFNuONeoDyKOSNLulSkL9hcC/deWfBXYlei9fEYmqtSriinNS+SlSp5slNSbFvDYk2Gp3Tb0+mptdcy5+p1ty/GKtmxSK+P0/i+F+Vf7MyVJFXH/7nwvyr/ZmbTSQsTKmDphqgU7jfd2An1T22BbU3HNDHp3KAfpzaeI9UpPSqUyGPNPOAIZTqNG3E7r2nmqJmJwyWqqaa6ZqjMRMZ9S+9gUj8KoNL/B7ezs+kT42zEvbO2lzqoOi6HdLVdoVvjk/qqfVPv8ASVUb8veo6Zg7F3/fz3Ox6Tw+d7c+76VKj7OX86P2D1A9faJTOzT0Ov0iDtJ95Wn+yfvj+kDvyL9IjF78wRVwyd4x8X1lYVksSOokeYyjK9d7sW+MSbeOUCJsR4uLXjtT2dlCsuvd6zPIWXIp3P8APbKqYYno80PK1VJsnF6P7VwXy9P65i2wLBSxGUD42n0TbeLXgxjamPwuITDVeRpVUqtWZSlPKupIZrZv1bxkdKxEShERAREQEREBERAREQEREBERApignxV17BPjYZT0HuZh9RlWIHgUhPuQdQnqICIiAmL2/wAHsJjUWniqIqqhzqCzqQ1rXBUg7jMpEDRqvFNsg7qNZPJxWI9bGWeK4ndnvoK+OW24cujgdzoZIsQIsHEtQW5pbQxSE6XK0m07coWWmI4nMR8DagPl4S/bvFSS9ECEavE7tAG6YrBvpbn03TTfuCtMXiuKPa+a4XAta2lOqVBt1q1MCdBRA54xPADbaszewQ+Y5va8RhhbnO1hdgbc8jX4OkxGJ4F7VBJfZeIN7bgtQ6E3sUJ6DbsAE6eiBy3s7gXtOrVZV2filJN/bKTUFAJPw6ll+mSDwe4n61w+KxK0v8OgBUex/wCNhlHmMmOJMDXNj8B9nYch0w6vUGvK1ya9S/WC98v6tpscRKEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERED/9k=",
          },
        ],
      },
    ],
    feedbacks: [
      {
        _id: "fb1",
        screenshot: "https://nventmarketing.com/images/mobile-1.png",
      },
      {
        _id: "fb2",
        screenshot: "https://nventmarketing.com/images/mobile-1.png",
      },
      {
        _id: "fb3",
        screenshot:
          "https://leadferno.com/wp-content/uploads/review-request-ask-photos-DB.png",
      },
      {
        _id: "fb4",
        screenshot:
          "https://leadferno.com/wp-content/uploads/review-request-ask-photos-DB.png",
      },
      {
        _id: "fb4",
        screenshot:
          "      https://cdn.discordapp.com/attachments/912627262443114526/1368653347502162092/Screenshot_20250504-211841.jpg?ex=68190142&is=6817afc2&hm=b2c59968ad73ef02cdca69bbd5ef4ca2392d7c80adda91677242b76068c4bd1d&",
      },
    ],
  },
};

export default function HomePageContent() {
  const [data, setData] = useState<HomepageData | null>(dataArray.data);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [pauseFeedbackAutoSlide, setPauseFeedbackAutoSlide] = useState(false);

  useEffect(() => {
    // Only set up interval if auto-cycling is not paused
    if (!pauseFeedbackAutoSlide && dataArray?.data.feedbacks.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeedbackIndex(
          (prevIndex) => (prevIndex + 1) % dataArray.data.feedbacks.length
        );
      }, 5000); // Change feedback every 5 seconds

      return () => clearInterval(interval);
    }
  }, [pauseFeedbackAutoSlide, data]);

  const handleNextFeedback = () => {
    if (!data) return;
    setCurrentFeedbackIndex(
      (prevIndex) => (prevIndex + 1) % data.feedbacks.length
    );
    // Pause auto-cycling temporarily
    setPauseFeedbackAutoSlide(true);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };

  const handlePrevFeedback = () => {
    if (!data) return;
    setCurrentFeedbackIndex(
      (prevIndex) =>
        (prevIndex - 1 + data.feedbacks.length) % data.feedbacks.length
    );
    // Pause auto-cycling temporarily
    setPauseFeedbackAutoSlide(true);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };
  if (!data) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {/* Hero Background Image */}
        <img
          src={heroImage}
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight">
            You Need To Smell Good
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Discover luxurious scents crafted to impress.
          </p>
          <Link
            to="/samples"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
          >
            Browse Samples
          </Link>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>
      </section>

      {/* For Him / For Her Sections */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Collections
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* For Him Section */}
            <div className="flex-1">
              <div className="bg-black rounded-lg overflow-hidden shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3
                      className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg"
                      style={{
                        fontFamily: "serif",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      For him
                    </h3>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-2 p-6">
                    {/* Display perfume bottles in a grid */}
                    <img
                      src={menPerfume}
                      alt="Hero background"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 bg-black text-white">
                  <Link
                    to="/men-fragrances"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-xl font-semibold">
                      Men Fragrances
                    </span>
                    <svg
                      className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* For Her Section */}
            <div className="flex-1">
              <div className="bg-black rounded-lg overflow-hidden shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3
                      className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg"
                      style={{
                        fontFamily: "serif",
                        color: "#ffb6c1",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      For her
                    </h3>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-2 p-6">
                    {/* Display perfume bottles in a grid */}
                    <img
                      src={femalePerfume}
                      alt="Hero background"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 bg-black text-white">
                  <Link
                    to="/women-fragrances"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-xl font-semibold">
                      Women Fragrances
                    </span>
                    <svg
                      className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Featured Items
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.featuredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:scale-[1.02]"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 rounded-lg mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full max-h-60 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-bold">${item.price}</p>
                      <p className="text-sm text-gray-500">
                        Sizes: {item.sizes.join(", ")}ml
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="container mx-auto mb-16 px-4 bg-gray-50 py-8">
        <div className="mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Collections</h2>
          <div className="space-y-12">
            {data.collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {collection.products.map((product) => (
                    <div
                      key={product._id}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition"
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Customer Feedback
          </h2>

          {/* Carousel Container */}
          <div
            className="relative mx-auto"
            style={{ maxWidth: "min(90vw, 500px)" }}
          >
            {/* Feedback Display */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
              {/* Fixed aspect ratio container */}
              <div className="relative pb-[180%] w-full">
                {/* Image container with absolute positioning */}
                <div className="absolute p-4 flex items-center justify-center">
                  <img
                    src={data.feedbacks[currentFeedbackIndex].screenshot}
                    alt="Customer feedback"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={handlePrevFeedback}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-black text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
              aria-label="Previous feedback"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>

            <button
              onClick={handleNextFeedback}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-black text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
              aria-label="Next feedback"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {data.feedbacks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFeedbackIndex(index);
                    setPauseFeedbackAutoSlide(true);
                    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentFeedbackIndex === index
                      ? "w-6 bg-black"
                      : "w-2 bg-gray-400"
                  }`}
                  aria-label={`Go to feedback ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
