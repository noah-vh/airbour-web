"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Lightbulb,
  FileEdit,
  CheckCircle2,
  ArrowRight,
  X,
  FolderOpen,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentIdea {
  format: string;
  hook: string;
  angle: string;
  description: string;
  suggestedStructure?: any;
  outline?: any;
  signalIds?: string[];
  mentionIds?: string[];
}

type WorkflowStep = "discover" | "ideas" | "compose";

export default function ContentIdeationPage() {
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]);
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("ideas");
  const [showLibrary, setShowLibrary] = useState(false);

  const handleStepChange = (step: WorkflowStep) => {
    setCurrentStep(step);
  };

  const handleIdeaSelect = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setCurrentStep("compose");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "discover":
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Content Discovery</span>
              </CardTitle>
              <CardDescription>
                Discover signals and mentions to inspire your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Content discovery functionality would be implemented here.
                This would include searching and filtering signals and mentions.
              </div>
            </CardContent>
          </Card>
        );

      case "ideas":
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Idea Generation</span>
              </CardTitle>
              <CardDescription>
                Generate content ideas from selected signals and mentions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{selectedSignalIds.length} signals</Badge>
                    <Badge variant="outline">{selectedMentionIds.length} mentions</Badge>
                  </div>
                  <Button onClick={() => {/* Generate ideas */}}>
                    Generate Ideas
                  </Button>
                </div>

                <div className="text-center py-12 text-muted-foreground">
                  Content idea generation interface would be here.
                  This would show generated ideas based on selected signals and mentions.
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "compose":
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileEdit className="h-5 w-5" />
                <span>Content Composer</span>
              </CardTitle>
              <CardDescription>
                Compose your content based on the selected idea
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedIdea ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-medium">{selectedIdea.format}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedIdea.description}</p>
                    <p className="text-sm mt-2"><strong>Hook:</strong> {selectedIdea.hook}</p>
                    <p className="text-sm"><strong>Angle:</strong> {selectedIdea.angle}</p>
                  </div>

                  <div className="text-center py-12 text-muted-foreground">
                    Content composition interface would be here.
                    This would include a rich text editor for creating content.
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select an idea from the Ideas step to start composing.
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Ideation</h1>
          <p className="text-muted-foreground">
            Transform signals and mentions into compelling content ideas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center space-x-2"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Content Library</span>
          </Button>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          {(["discover", "ideas", "compose"] as WorkflowStep[]).map((step, index) => {
            const isActive = currentStep === step;
            const isCompleted = ["discover", "ideas", "compose"].indexOf(currentStep) > index;

            return (
              <div key={step} className="flex items-center">
                <Button
                  variant={isActive ? "default" : isCompleted ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleStepChange(step)}
                  className="flex items-center space-x-2"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step === "discover" ? (
                    <Search className="h-4 w-4" />
                  ) : step === "ideas" ? (
                    <Lightbulb className="h-4 w-4" />
                  ) : (
                    <FileEdit className="h-4 w-4" />
                  )}
                  <span className="capitalize">{step}</span>
                </Button>

                {index < 2 && (
                  <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}