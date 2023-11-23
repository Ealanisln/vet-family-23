import React from "react";
import { SanityDocument } from "@sanity/client";
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  XIcon,
} from "react-share";
import { usePathname } from "next/navigation";

const Share = ({ post }: { post: SanityDocument }) => {
  const pathname = usePathname();

  const pageUrl = process.env.NEXT_PUBLIC_SITE_URL;


  const shareUrl =
    typeof window !== "undefined"
      ? pageUrl + pathname
      : "http://www.familyvet23.com";
  const title = post.title;

  return (
    <>
      <h3 className="text-2xl sm:text-xl font-semibold text-black text-left my-10">
        Comparte este artículo en redes sociales:
      </h3>

      <div className="flex space-x-4">
        <TwitterShareButton
          url={shareUrl}
          title={title}
          className="Demo__some-network__share-button"
        >
          <XIcon size={32} round />
        </TwitterShareButton>

        <FacebookShareButton
          url={shareUrl}
          className="Demo__some-network__share-button"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </>
  );
};

export default Share;
