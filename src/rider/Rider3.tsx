import { Link } from "react-router-dom";
import welCat from "../assets/undraw_terms_7l7t 1.png";
export const Rider3 = () => {
  return (
    <>
      {/* container */}
      <div>
        {/* skip */}
        <Link to="/welcome4">
          <p className="text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-emerald-600 font-sans font-semibold text-right p-4 cursor-pointer hover:text-emerald-700 transition-colors">
            Skip
          </p>
        </Link>
        {/* end of  skip */}
        <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-emerald-600 font-sans font-semibold text-center">
          List Your Services
        </p>

        {/* welcom */}
        <div className="max-w-[300px] max-h-[153px] mx-auto animate-bounce mt-[50px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <img src={welCat} alt="" className="object-cover" />
        </div>
        {/* cart welcome image */}
        {/* welcome text */}
        <p className="max-w-[340px] text-center text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-gray-500 font-sans  font-semibold mx-auto mt-[10rem] ">
          Highlight the services you excel at – from chef to catery services
        </p>
        {/* welcome text */}
        {/* butt */}
        <div className="flex  justify-center ">
          <Link to="/welcome4" className="w-full flex justify-center">
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
