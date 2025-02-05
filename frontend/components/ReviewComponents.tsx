import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ReviewCard from "./ReviewCard";

const ReviewComponents = () => {
  return (
    <section className="page-pad py-10 flex flex-row justify-between items-center flex-wrap gap-5">
      <div className="flex flex-col">
        <span className="flex flex-col gap-2">
          <p className="text-primary font-semibold text-lg">TESTIMONIALS</p>
          <h3 className="font-semibold text-3xl">
            Look What Our <br /> Customers Say!
          </h3>
        </span>
      </div>
      <Carousel>
        <CarouselContent className="max-w-[500px]">
          <CarouselItem>
            <ReviewCard />
          </CarouselItem>
          <CarouselItem>
            <ReviewCard />
          </CarouselItem>
          <CarouselItem>
            <ReviewCard />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default ReviewComponents;
