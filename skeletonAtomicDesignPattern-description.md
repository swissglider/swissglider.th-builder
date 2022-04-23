# Skeleton Atomic Design Pattern:
This describes how I have implemented internally the Atomic Design Pattern (in *./src*).  
As this is a library only Pages and Components are for interrest for others

## Atoms
Atoms are single Design Elements 
- only with properties
- without any states that are not local
- do not include other atoms

## Pro-Atoms
Like Atoms but:
- includes other Atoms

## Molecules
Combines Atoms/Pro-Atoms with global states
- Do not build any design elements
- Do not include other Molecules

## Organisms
Cobines Atoms / Pro-Atoms / Molecules
- Do not build any designe elements except i.e Box..


## Pages
Pages that will be exported for others


## Components
Finished Skeleton Components that can be uses for others...


## Addons
This are:
- **helpers** (single functions that can be used everywhere, no hooks !)
- **hooks** (no hookstates)
- **states** this are all also hooks (hookstates)
- **types** used everywhere (types and interfaces)
  

## Infos
- **no.story** --> is just a file to declare that there will be no storybook


## Storybook
Storybook is used for each element.  
Some very few of theme have no story (there is a no.story file in the folder of theme)  
Most of theme are only used for internal. There for there are separated into:
- internal
- external