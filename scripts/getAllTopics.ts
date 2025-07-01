// scripts/getCoreTopics.ts
import { ethers } from "hardhat";
import { Interface } from "ethers/lib/utils";
import { AbiEvent } from "hardhat/types";
import * as fs from 'fs';
import * as path from 'path';

// Contract configurations with their paths
const CONTRACTS = [
    { name: "Vault", path: "core" },
    { name: "PositionRouter", path: "core" },
    { name: "OrderBook", path: "core" },
    { name: "FastPriceFeed", path: "oracle" },
    { name: "Router", path: "peripherals" }
];

// Find artifact file recursively
function findArtifact(contractName: string): string | null {
    const artifactsDir = path.join(__dirname, '../artifacts');
    
    // Search function
    function searchInDir(dir: string): string | null {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                const result = searchInDir(filePath);
                if (result) return result;
            } else if (file === `${contractName}.json`) {
                return filePath;
            }
        }
        return null;
    }
    
    return searchInDir(artifactsDir);
}

async function processContract(contract: { name: string, path: string }) {
    try {
        // Find and get contract artifact
        const artifactPath = findArtifact(contract.name);
        if (!artifactPath) {
            throw new Error(`Artifact not found for ${contract.name}`);
        }
        
        const artifact = require(artifactPath);
        
        // Create interface from ABI
        const iface: Interface = new ethers.utils.Interface(artifact.abi);
        
        console.log("=".repeat(50));
        console.log(`\nEvent Topics for contract: ${contract.name}`);
        console.log("Location:", contract.path);

        // Filter only events from ABI
        const events: AbiEvent[] = artifact.abi.filter((item: any) => item.type === "event");
        
        if (events.length === 0) {
            console.log("No events found in contract");
            return;
        }

        // Process each event
        events.forEach((event: AbiEvent) => {
            const signature = `${event.name}(${event.inputs.map(input => input.type).join(',')})`;
            const topic = ethers.utils.id(signature);
            
            console.log("\nEvent Name:", event.name);
            console.log("Signature:", signature);
            console.log("Topic Hash:", topic);
            
            console.log("\nParameters:");
            event.inputs.forEach((input, index) => {
                console.log(`  ${index + 1}. ${input.name} (${input.type})${input.indexed ? ' [indexed]' : ''}`);
            });
            
            // console.log("-".repeat(50));
        });
    } catch (error) {
        console.error(`Error processing contract ${contract.name}:`, error.message);
    }
}

async function main() {
    console.log("Starting contract processing...\n");
    
    for (const contract of CONTRACTS) {
        await processContract(contract);
    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Critical error:", error);
        process.exit(1);
    });