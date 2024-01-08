export interface IBlogProps {
     label: string;
     subLabel: string;
     body: string;
     comment?: IBlogCommentProps[];
}

export interface IBlogCommentProps {
     userId: string;
     body: string;
}
