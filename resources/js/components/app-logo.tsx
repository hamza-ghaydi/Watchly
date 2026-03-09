import images from "@/constants/images";

export default function AppLogo() {
    return (
        <>
            <div className="flex mx-auto items-center justify-center">
                <img 
                    src={images.logo}
                    alt="Watchly" 
                    className="w-40 object-cover"
                />
            </div>
        </>
    );
}
