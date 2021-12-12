export const handler = async (event: {
    message: string;
}): Promise<{
    statusCode: number;
    body: {
        message: string;
    };
}> => {
    console.dir(event);
    return {
        statusCode: 200,
        body: {
            message: event.message,
        },
    };
};
