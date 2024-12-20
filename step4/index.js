import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import main from './circuits/main/target/step4.json' assert { type: "json" };
import { writeFileSync } from 'fs';

async function generateAndVerifyProof() {
    const backend = new BarretenbergBackend(main, { threads: 8 });
    const noir = new Noir(main);
    const input = { x: 1, y: 2 };
    const { witness } = await noir.execute(input);
    const { proof, publicInputs } = await backend.generateProof(witness);

    const proofHex = '0x' + Array.from(proof)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    const publicInputsHex = publicInputs.map(input => {
        if (typeof input === 'string' && input.startsWith('0x')) {
            return input;
        } else {
            return '0x' + Buffer.from(input).toString('hex');
        }
    });

    const proofData = {
        proof: proofHex,
        publicInputs: publicInputsHex
    };

    writeFileSync('proof.json', JSON.stringify(proofData, null, 2));

    console.log("Proof saved to proof.json as hex string");
    
    const verified = await backend.verifyProof({ proof: proof, publicInputs: publicInputs });
    console.log("Verified:", verified);
}

generateAndVerifyProof().catch(console.error);
