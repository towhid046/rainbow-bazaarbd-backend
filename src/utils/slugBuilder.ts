export const slugBuilder = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special characters
      .replace(/\s+/g, "-") // replace spaces with -
      .replace(/-+/g, "-"); // remove duplicate -
  };