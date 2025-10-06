import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "../hooks/useChat";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    "mouthSmile": 0.27,
  "browInnerUp": 0.8999999988035766,
  "browOuterUpLeft": 0.7999999986888522,
  "browOuterUpRight": 0.869999998574126,
  "mouthPressLeft": 1,
  "mouthPressRight": 1,
  "eyesLookUp": 0.2

  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
     "mouthOpen": 0.21,
  "mouthSmile": 1,
  "browInnerUp": 0.52,
  "eyeWideLeft": 1,
  "eyeWideRight": 1,
  "jawOpen": 1
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

export function Avatar(props) {
  const { nodes, materials, scene } = useGLTF(
    "/models/68e0efe29f7e763dce7f126b.glb"
  );

  const { message, onMessagePlayed, chat } = useChat();
  const [lipsync, setLipsync] = useState();
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();
  const audioRef = useRef(null);
  const messageIdRef = useRef(null);
  
  // Non-verbal cues state
  const [headTilt, setHeadTilt] = useState(0);
  const [headNod, setHeadNod] = useState(0);
  const groupRef = useRef();

  useEffect(() => {
    console.log('New message received:', message);
    if (!message) {
      setAnimation("Idle");
      setAudio(null);
      return;
    }
    
    const messageId = message.text + message.audio;
    if (messageIdRef.current === messageId) {
      console.log('Same message, skipping...');
      return;
    }
    messageIdRef.current = messageId;
    
    if (audioRef.current) {
      console.log('Stopping previous audio');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    
    // Add body language based on emotion
    triggerBodyLanguage(message.facialExpression, message.text);
    
    if (message.audio) {
      const newAudio = new Audio(message.audio);
      audioRef.current = newAudio;
      
      newAudio.addEventListener('loadedmetadata', () => {
        console.log('Audio loaded, duration:', newAudio.duration);
      });
      
      setTimeout(() => {
        newAudio.play()
          .then(() => console.log('Audio playing...'))
          .catch(err => console.error("Audio play error:", err));
      }, 10);
      
      setAudio(newAudio);
      
      newAudio.onended = () => {
        console.log('Audio ended naturally');
        audioRef.current = null;
        setAudio(null);
        onMessagePlayed();
      };
      
      newAudio.onerror = (e) => {
        console.error('Audio error:', e);
        audioRef.current = null;
        setAudio(null);
        onMessagePlayed();
      };
    } else {
      console.warn('No audio in message');
      onMessagePlayed();
    }
  }, [message]);

  // Auto-transition surprised expression to smile after 3 seconds
  useEffect(() => {
    if (facialExpression === 'surprised') {
      const timer = setTimeout(() => {
        console.log('🎭 Transitioning from surprised to smile');
        setFacialExpression('smile');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [facialExpression]);

  // Body language triggers based on emotion and content
  const triggerBodyLanguage = (emotion, text) => {
    const lowerText = text.toLowerCase();
    
    // Head tilt for questions or curiosity
    if (lowerText.includes('?') || lowerText.includes('wonder') || lowerText.includes('think')) {
      animateHeadTilt();
    }
    
    // Head nod for affirmations
    if (lowerText.includes('yes') || lowerText.includes('exactly') || lowerText.includes('definitely') || lowerText.includes('absolutely')) {
      animateHeadNod();
    }
    
    // Random playful wink for jokes or happy moments
    if (emotion === 'funnyFace' || emotion === 'smile') {
      if (Math.random() > 0.7) { // 30% chance
        setTimeout(() => {
          const whichEye = Math.random() > 0.5;
          if (whichEye) {
            setWinkLeft(true);
            setTimeout(() => setWinkLeft(false), 300);
          } else {
            setWinkRight(true);
            setTimeout(() => setWinkRight(false), 300);
          }
        }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
      }
    }
  };

  const animateHeadTilt = () => {
    const tiltAmount = 0.15;
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const tiltInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = Math.sin(progress * Math.PI);
      setHeadTilt(easedProgress * tiltAmount);

      if (currentStep >= steps) {
        clearInterval(tiltInterval);
        setHeadTilt(0);
      }
    }, stepTime);
  };

  const animateHeadNod = () => {
    const nodAmount = 0.2;
    const nodCount = 2;
    let currentNod = 0;

    const performNod = () => {
      setHeadNod(nodAmount);
      setTimeout(() => {
        setHeadNod(0);
        currentNod++;
        if (currentNod < nodCount) {
          setTimeout(performNod, 200);
        }
      }, 800);
    };

    performNod();
  };

  const { animations } = useGLTF("/models/animations.glb");
  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name
  );

  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();
      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.5);
        }
      };
    }
  }, [animation, actions, mixer]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );

        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };

  useFrame(() => {
    if (!nodes.EyeLeft || !nodes.EyeLeft.morphTargetDictionary) return;
    
    // Apply head movements
    if (group.current) {
      // Head tilt (rotation on Z axis)
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        headTilt,
        0.1
      );
      
      // Head nod (rotation on X axis)
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -headNod,
        0.15
      );
    }
    
    !setupMode &&
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return;
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    if (setupMode) {
      return;
    }

    const appliedMorphTargets = [];
    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          appliedMorphTargets.push(corresponding[mouthCue.value]);
          lerpMorphTarget(corresponding[mouthCue.value], 1, 0.4);
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.3);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    headTilt: button(() => animateHeadTilt()),
    headNod: button(() => animateHeadNod()),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      const emotionValues = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return;
        }
        const value =
          nodes.EyeLeft.morphTargetInfluences[
            nodes.EyeLeft.morphTargetDictionary[key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: nodes.EyeLeft.morphTargetInfluences[
              nodes.EyeLeft.morphTargetDictionary[key]
            ],
            max: 1,
            onChange: (val) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    )
  );

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload("/models/68e0efe29f7e763dce7f126b.glb");
useGLTF.preload("/models/animations.glb");