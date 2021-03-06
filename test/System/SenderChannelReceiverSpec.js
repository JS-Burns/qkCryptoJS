import 'babel-polyfill';
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
import { getBaseCommunicator } from "../../src/Actors/BaseCommunicator.js";
import { getSender } from "../../src/Actors/Sender.js";
import { getReceiver } from "../../src/Actors/Receiver.js";
import { getQuantumChannel } from "../../src/Channels/QuantumChannel.js";
import { PhotonsSize, MinSharedKeyLength } from "../../src/Config/AppConfig.js";

describe('Sender, Channel, and Receiver', function () {
    this.timeout(150000);
    it('Sender and Receiver should have same key when coming to an agreement with no Attacker.', () => {
        var agreementCount = 0;
        var numberOfSystemRuns = 5000;

        for (var i = 0; i < numberOfSystemRuns; i++) {
            var senderBaseComm = getBaseCommunicator();
            var sender = getSender(senderBaseComm);
            var channel = getQuantumChannel();

            var receiverBaseComm = getBaseCommunicator();
            var receiver = getReceiver(receiverBaseComm);

            sender.generateRandoms();
            sender.calculatePolarizations();
            sender.sendPhotonsToChannel(channel);

            receiver.generateRandomBasis();
            receiver.measurePhotonsFromChannel(channel);

            sender.sendBasisToChannel(channel);
            receiver.readBasisFromChannel(channel);

            receiver.sendBasisToChannel(channel);
            sender.readBasisFromChannel(channel);

            receiver.generateSharedKey();
            sender.generateSharedKey();

            sender.decide();
            receiver.decide();

            sender.sendDecisionToChannel(channel);
            receiver.readDecisionFromChannel(channel);

            receiver.sendDecisionToChannel(channel);
            sender.readDecisionFromChannel(channel);

            if (receiver.getDecision() && sender.getDecision()) {
                assert.deepEqual(receiver.getSharedKey(), sender.getSharedKey());
                agreementCount++;
            }
        }
        /*
          This isn't guaranteed to pass. Receiver's random basis generation and measurement
          can cause to fail even with no attacker. The hope is that over a large amount
          of simulations, that atleast 50% of the time the two agree on a key after an
          exchange.
        */
        assert.isTrue(agreementCount > 0);
    });
});
