export interface IBlogProps {
     label: string;
     subLabel: string;
     body: string;
     comment?: IBlogCommentProps[];
     blogLink:string
}

export interface IBlogCommentProps {
     userId: string;
     body: string;
}
