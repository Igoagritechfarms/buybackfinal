import { StatsCounter } from '../components/StatsCounter';
import { HeroSection } from '../components/sections/HeroSection';
import { AdvancedMarketTicker } from '../components/AdvancedMarketTicker';
import { TrustedPartnersSection } from '../components/sections/TrustedPartnersSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { VisionMissionSection } from '../components/sections/VisionMissionSection';
import { PriceCalculatorSection } from '../components/sections/PriceCalculatorSection';
import { DailyMarketTrendsSection } from '../components/sections/DailyMarketTrendsSection';
import { FormsSection } from '../components/sections/FormsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { WhyChooseUsSection } from '../components/sections/WhyChooseUsSection';

export const Home = () => (
  <>
    <AdvancedMarketTicker />
    <HeroSection />
    <HowItWorksSection />
    <VisionMissionSection />
    <StatsCounter />
    <PriceCalculatorSection />
    <DailyMarketTrendsSection />
    <TrustedPartnersSection />
    <FormsSection />
    <TestimonialsSection />
    <WhyChooseUsSection />
  </>
);
