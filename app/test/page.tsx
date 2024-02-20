import cloudinary from "cloudinary";
import { CloudinaryImage } from "./cloudinary-image";

type SearchResult = {
    public_id: string;
    width: number;
    height: number;
}

export default async function Gallery() {
    const results = await cloudinary.v2.search
        .expression("resource_type:image AND tags=VetFamily")
        .sort_by("public_id", "desc")
        .max_results(30)
        .execute() as {resources: SearchResult[]};

        console.log(results)

  return (
    <>
   <div className="grid grid-cols-4 gap-4">
    {results.resources.map((result) => (
        <CloudinaryImage
        width="400"
        height="300"
        key={result.public_id}
        src={result.public_id}
        alt="An image example"
        
        />
    ))}
</div>

    </>
  )
}

