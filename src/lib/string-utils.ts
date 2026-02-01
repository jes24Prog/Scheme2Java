export const toPascalCase = (str: string) => {
    if (!str) return '';
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase()).replace(/[-_]/g, '');
}

export const toCamelCase = (str: string) => {
  if (!str) return '';
  // First, convert to PascalCase to handle various inputs (snake_case, kebab-case)
  const pascal = str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase()).replace(/[-_]/g, '');
  // Then, convert the first character to lowercase
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};
