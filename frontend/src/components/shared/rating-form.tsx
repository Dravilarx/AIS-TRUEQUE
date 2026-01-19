import { useState } from 'react';
import { Star, ThumbsUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/shared/star-rating';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface RatingFormProps {
    targetId: string;
    targetType: 'user' | 'service';
    targetName: string;
    onSubmit: (data: {
        score: { overall: number };
        comment: string;
        recommend: boolean;
    }) => Promise<boolean>;
    onCancel?: () => void;
    loading?: boolean;
}

export function RatingForm({
    targetId,
    targetType,
    targetName,
    onSubmit,
    onCancel,
    loading = false,
}: RatingFormProps) {
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [recommend, setRecommend] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (score === 0) {
            toast.error('Selecciona una calificación');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('El comentario debe tener al menos 10 caracteres');
            return;
        }

        setSubmitting(true);

        const success = await onSubmit({
            score: { overall: score },
            comment,
            recommend,
        });

        setSubmitting(false);

        if (success) {
            setScore(0);
            setComment('');
            setRecommend(true);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    Calificar a {targetName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Tu calificación *
                        </label>
                        <StarRating
                            rating={score}
                            onChange={setScore}
                            interactive
                            size="lg"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                            {score === 0 && 'Haz clic para calificar'}
                            {score === 1 && 'Muy malo'}
                            {score === 2 && 'Malo'}
                            {score === 3 && 'Regular'}
                            {score === 4 && 'Bueno'}
                            {score === 5 && 'Excelente'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Tu comentario *
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comparte tu experiencia..."
                            rows={4}
                            maxLength={500}
                            disabled={submitting || loading}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            {comment.length}/500 caracteres
                        </p>
                    </div>

                    {/* Recommend */}
                    <div>
                        <label className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRecommend(!recommend)}
                                disabled={submitting || loading}
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                                    recommend
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                <ThumbsUp className={cn('h-5 w-5', recommend && 'fill-current')} />
                            </button>
                            <span className="text-sm">
                                {recommend
                                    ? '¡Sí, lo recomiendo!'
                                    : 'No lo recomiendo'}
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={submitting || loading}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={submitting || loading}
                            className="flex-1"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar calificación'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
