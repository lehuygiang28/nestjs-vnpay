export function helloWorld(): string {
    return 'Hello World!';
}

export async function helloWorldAsync(): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Hello World async!');
        }, 1000);
    });
}
