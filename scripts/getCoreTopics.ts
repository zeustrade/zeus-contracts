// scripts/getEventTopics.js
import { ethers } from "hardhat";
import { Interface } from "ethers/lib/utils";
import { AbiEvent } from "hardhat/types";

async function main() {
    // Получаем артефакт контракта (замените YourContract на имя вашего контракта)
    const artifact = require("../artifacts/contracts/core/Vault.sol/Vault.json");
    
    // Создаем интерфейс из ABI
    const iface: Interface = new ethers.utils.Interface(artifact.abi);
    
    console.log("\nEvent Topics for contract:", artifact.contractName);
    console.log("=".repeat(50));

    // Фильтруем только события из ABI
    const events: AbiEvent[] = artifact.abi.filter((item: any) => item.type === "event");
    
    // Для каждого события получаем хеш и выводим информацию
    events.forEach((event: AbiEvent) => {
        // Формируем сигнатуру события
        const signature = `${event.name}(${event.inputs.map(input => input.type).join(',')})`;
        
        // Получаем хеш топика
        const topic = ethers.utils.id(signature);
        
        console.log("\nEvent Name:", event.name);
        console.log("Signature:", signature);
        console.log("Topic Hash:", topic);
        
        // Выводим информацию о параметрах
        console.log("\nParameters:");
        event.inputs.forEach((input, index) => {
            console.log(`  ${index + 1}. ${input.name} (${input.type})${input.indexed ? ' [indexed]' : ''}`);
        });
        
        console.log("-".repeat(50));
    });
}

// Запускаем скрипт
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });