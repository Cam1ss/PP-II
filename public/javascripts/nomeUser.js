document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/user");
        if (response.ok) {
            const { username } = await response.json();
            const greetingElement = document.getElementById("nomeUser");
            if (greetingElement) {
                greetingElement.textContent = `Olá, ${username}!`;
            }
        } else {
            console.error("Não foi possível obter o nome do usuário");
        }
    } catch (error) {
        console.error("Erro ao obter o nome do usuário:", error);
    }
});
