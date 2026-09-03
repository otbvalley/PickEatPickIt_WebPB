import { Link } from "react-router-dom";
import welCat from "../assets/undraw_welcome-cats_tw36 1.png";
export const Rider1 = () => {
  return (
    <>
      {/* container */}
      <div>
        {/* skip */}
        <Link to="/welcome2">
          <p className="text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-emerald-600 font-sans font-semibold text-right p-4 cursor-pointer hover:text-emerald-700 transition-colors">
            Skip
          </p>
        </Link>

        {/* end of  skip */}
        <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-emerald-600 font-sans font-semibold text-center">
          Welcome
        </p>

        {/* welcom */}
        <div className="max-w-[300px] max-h-[153px] mx-auto animate-bounce mt-[150px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <img src={welCat} alt="" />
        </div>
        {/* cart welcome image */}
        {/* welcome text */}
        <p className="max-w-[340px] text-center text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-gray-500 font-sans  font-semibold mx-auto mt-[5rem]">
          Welcome to your PickitPickEat for vendor expertise. Join us and start
          your journey today
        </p>
        {/* welcome text */}
        {/* butt */}
        <div className="flex  justify-center ">
          <Link to="/welcome2" className="w-full flex justify-center">
            {" "}
            <button className="text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-white font-sans font-semibold max-w-[289px] w-full   bg-emerald-600 max-h-[49px] h-[30px] lg:[49px] rounded-xl mt-[5rem] hover:bg-emerald-700 cursor-pointer transition-colors duration-300 mb-[2rem]">
              Next
            </button>
          </Link>
        </div>
        {/* butt */}
      </div>
      {/* end of  container */}
    </>
  );
};
